package oauth

import (
  "log"
  "errors"
  "io/ioutil"
  "net/http"
  "encoding/json"
  "golang.org/x/oauth2"
  "github.com/makenneth/letspaint/api_server/models"
  "github.com/makenneth/letspaint/api_server/utils/cookieJar"
)

type GoogleOAuthData struct {
  ServiceId string `json:"sub"`
  Verified  bool `json:"email_verified"`
  Name string `json:"name"`
}

func GetLoginURL(requestType, authType, state string) string {
  log.Println(requestType, authType, state)
  return oauthCredentials[authType][requestType].AuthCodeURL(state)
}

func GoogleOAuthHandler(requestType string, w http.ResponseWriter, r *http.Request, next func(int, error)) {
  cookie, err := r.Cookie("oauth-tok")
  log.Println(requestType)
  if _, ok := oauthCredentials["google"]; !ok {
    next(404, errors.New("OAuth Type not supported"))
    return
  }
  if err == nil && cookie.String() != "" {
    if r.URL.Query().Get("state") == cookie.Value {
      tok, err := oauthCredentials["google"][requestType].Exchange(oauth2.NoContext, r.URL.Query().Get("code"))
      if err == nil {
        client := oauthCredentials["google"][requestType].Client(oauth2.NoContext, tok)
        resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
        if err == nil {
          defer resp.Body.Close()
          responseData, _ := ioutil.ReadAll(resp.Body)
          log.Println(string(responseData[:]))

          var data *GoogleOAuthData
          err = json.Unmarshal(responseData, &data)
          log.Println(err)
          log.Println("data", data)
          if !data.Verified {
            // set error in cookie
          }
          var (
            sessionToken string
            user *models.User
          )
          if requestType == "signup" {
            user = &models.User{Name: data.Name, ServiceId: data.ServiceId}
            sessionToken, err = user.Save()
            if err != nil {
              log.Println(err)
              next(404, errors.New("Unable to save user"))
              return
            }
          } else {
            user, err = models.FindByOAuthId(data.ServiceId)
            if err != nil {
              next(404, errors.New("User Not Found"))
              return
            }
            sessionToken, err = user.ResetSessionToken()
            if err != nil {
              log.Println("Unable reset session token error")
              next(500, errors.New("Internal server error"))
              return
            }
          }

          userJson, _ := json.Marshal(user)
          log.Println(string(userJson[:]))
          cookieJar.SetSessionToken(w, sessionToken)
          http.Redirect(w, r, "/auth/success", 302)
        }
      }
    }
  }

  next(403, errors.New("Invalid token"))
}

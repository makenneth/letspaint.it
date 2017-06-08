package oauth

import (
  "log"
  "io/ioutil"
  "net/http"
  "encoding/json"
  "golang.org/x/oauth2"
  "github.com/makenneth/letspaint/api_server/models"
)

type GoogleOAuthData struct {
  ServiceId string `json:"sub"`
  Verified  bool `json:"email_verified"`
  Name string `json:"name"`
}

func GetLoginURL(requestType, authType, state string) string {
  return oauthCredentials[authType][requestType].AuthCodeURL(state)
}

func GoogleOAuthHandler(requestType string, w http.ResponseWriter, r *http.Request) (int, string) {
  cookie, err := r.Cookie("oauth-tok")
  if _, ok := oauthCredentials["google"]; !ok {
    return 404, "OAuth Type not supported"
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
              return 404, "Unable to save user"
            }
          } else {
            user, err = models.FindByOAuthId(data.ServiceId)
            if err != nil {
              return 404, "User Not Found"
            }
            sessionToken, err = user.ResetSessionToken()
            if err != nil {
              log.Println("Unable reset session token error")
              return 500, "Internal server error"
            }
          }

          userJson, _ := json.Marshal(user)
          log.Println(string(userJson[:]))
          cookie := http.Cookie{
            Name: "session_token",
            Value: sessionToken,
            Path: "/",
            HttpOnly: true,
          }
          http.SetCookie(w, &cookie)
          http.Redirect(w, r, "/auth/success", 302)
          return 0, ""
        }
      }
    }
  }

  return 403, "Invalid token"
}

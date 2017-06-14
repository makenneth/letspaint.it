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
  Email string `json:"email"`
}

func GoogleOAuthHandler(requestType string, w http.ResponseWriter, r *http.Request, next func(error)) {
  cookie, err := r.Cookie("oauth-tok")
  log.Println(requestType)
  if _, ok := oauthCredentials["google"]; !ok {
    next(errors.New("OAuth Type not supported"))
    return
  }
  if err != nil || cookie.String() == "" {
    log.Println("err", err)
    log.Println("cookie", cookie.String())
    next(errors.New("Invalid token."))
    return
  } else if r.URL.Query().Get("state") != cookie.Value {
    log.Println("value mismatch")
    next(errors.New("Invalid access."))
    return
  }

  tok, err := oauthCredentials["google"][requestType].Exchange(oauth2.NoContext, r.URL.Query().Get("code"))
  if err != nil {
    next(errors.New("Failed to authenticate."))
    return
  }

  client := oauthCredentials["google"][requestType].Client(oauth2.NoContext, tok)
  resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
  defer resp.Body.Close()
  if err != nil {
    next(errors.New("Failed to authenticate."))
    return
  }

  responseData, _ := ioutil.ReadAll(resp.Body)
  log.Println(string(responseData[:]))

  var (
    data *GoogleOAuthData
  )
  registered := false
  err = json.Unmarshal(responseData, &data)

  var (
    sessionToken string
    user *models.User
  )
  if requestType == "signup" {
    user = &models.User{Name: data.Name, ServiceId: data.ServiceId, Email: data.Email}
    sessionToken, err = user.Save()

    if err != nil {
      if err.Error() == "User has already been registered" {
        registered = true
      } else {
        next(errors.New("Unable to save user"))
        return
      }
    }
  }

  if requestType == "login" || registered {
    user, err = models.FindByOAuthId(data.ServiceId)
    if err != nil {
      log.Println("user not found")
      next(errors.New("User Not Found"))
      return
    }
    sessionToken, err = user.ResetSessionToken()
    if err != nil {
      log.Println("Unable reset session token error")
      next(errors.New("Internal server error"))
      return
    }
  }

  userJson, _ := json.Marshal(user)
  log.Println(string(userJson[:]))
  cookieJar.SetSessionToken(w, sessionToken)
  cookie = &http.Cookie{
    Name: "auth_success",
    Value: "true",
    HttpOnly: false,
    Path: "/",
    Domain: "127.0.0.1",
  }
  http.SetCookie(w, cookie)
  http.Redirect(w, r, "/auth/success", 302)
}

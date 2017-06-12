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

type FacebookOAuthData struct {
  ServiceId string `json:"id"`
  Name string `json:"name"`
  Email string `json:"email"`
}

func FacebookOAuthHandler(requestType string, w http.ResponseWriter, r *http.Request, next func(int, error)) {
  cookie, err := r.Cookie("oauth-tok")
  log.Println("cook1", cookie)
  if _, ok := oauthCredentials["facebook"]; !ok {
    next(404, errors.New("OAuth Type not supported"))
    return
  }
  if err != nil || cookie.String() == "" {
    log.Println("err", err)
    log.Println("cookie", cookie.String())
    next(403, errors.New("Invalid token."))
    return
  } else if r.URL.Query().Get("state") != cookie.Value {
    next(403, errors.New("Invalid access."))
    return
  }

  tok, err := oauthCredentials["facebook"][requestType].Exchange(oauth2.NoContext, r.URL.Query().Get("code"))
  if err != nil {
    next(403, errors.New("Failed to authenticate."))
    return
  }

  client := oauthCredentials["facebook"][requestType].Client(oauth2.NoContext, tok)
  resp, err := client.Get("https://graph.facebook.com/me?fields=id,name,email")
  if err != nil {
    next(403, errors.New("Failed to authenticate."))
    return
  }

  defer resp.Body.Close()
  responseData, _ := ioutil.ReadAll(resp.Body)

  var (
    data *FacebookOAuthData
    registered bool
  )
  err = json.Unmarshal(responseData, &data)
  log.Println("data", data)

  var (
    sessionToken string
    user *models.User
  )
  if requestType == "signup" {
    user = &models.User{Name: data.Name, ServiceId: data.ServiceId, Email: data.Email}
    sessionToken, err = user.Save()

    if err.Error() == "User has already been registered" {
      registered = true
    } else if err != nil {
      log.Println(err)
      next(404, errors.New("Unable to save user"))
      return
    }
  }

  if requestType == "login" || registered {
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

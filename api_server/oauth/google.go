package oauth

import (
  "log"
  "io/ioutil"
  "net/http"
  "encoding/json"
  "golang.org/x/oauth2"
)

type GoogleOAuthData struct {
  Service_Id int `json:"sub"`
  Verified  bool `json:"email_verified"`
  Name string `json:"name"`
}

func GetLoginURL(authType, state string) string {
  return oauthCredentials[authType].AuthCodeURL(state)
}

func GoogleOAuthHandler(w http.ResponseWriter, r *http.Request) (int, string) {
  cookie, err := r.Cookie("oauth-tok")
  if _, ok := oauthCredentials["google"]; !ok {
    return 404, "OAuth Type not supported"
  }
  if err == nil && cookie.String() != "" {
    if r.URL.Query().Get("state") == cookie.Value {
      tok, err := oauthCredentials["google"].Exchange(oauth2.NoContext, r.URL.Query().Get("code"))
      if err == nil {
        client := oauthCredentials["google"].Client(oauth2.NoContext, tok)
        resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
        if err == nil {
          defer resp.Body.Close()
          data, _ := ioutil.ReadAll(resp.Body)
          log.Println(string(data[:]))
          var googleData map[string]string

          err = json.Unmarshal(data, &googleData)
          log.Println(err)
          log.Println("data", googleData)
          // log.Println("Name", data["name"])
          // provider_type = "google"
          // client_id = data["sub"]

          // id
          // email
          //
          // token
          // cookie := http.Cookie{
          //   Name: "oauth-tok",
          //   Value: "",
          //   HttpOnly: true,
          // }
          // http.SetCookie(w, &cookie)

          // user, _ := json.Marshal(&User{Username: data["name"], Id: data["id"]})
          // cookie = http.Cookie{
          //   Name: "user_info",
          //   Value: user,
          //   MaxAge: 30,
          //   HttpOnly: false,
          // }
          // http.SetCookie(w, &cookie)
          return 0, ""
        }
      }
    }
  }

  return 403, "Invalid token"
}

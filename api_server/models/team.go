package models

import (
  // "log"
  "github.com/makenneth/letspaint/api_server/utils/connection"
)

type Team struct {
  Id int `json:"id"`
  Name string  `json:"name"`
  ImageUrl string `json:"imageUrl"`
  UserCount int `json:"userCount"`
  // Users []*User `json:"users"`
}

func GetTeamUsers(id int) ([]*User, error) {
  rows, err := connection.DB.Query(`
    SELECT u.id, u.name FROM teams AS t
    WHERE t.id = $1
    INNER JOIN team_users AS tu
    ON tu.team_id = t.id
    INNER JOIN users AS u
    ON tu.user_id = u.id
  `)
  defer rows.Close()
  var (
    user_id int
    name string
  )
  users := make([]*User, 0)
  if err != nil {
    return nil, err
  }

  for rows.Next() {
    err = rows.Scan(&user_id, &name)
    users = append(users, &User{Id: user_id, Name: name})
    if err != nil {
      return nil, err
    }
  }

  return users, nil
}

func GetTeam(id int) (*Team, error) {
  var (
    count int
    team_id int
    team_name string
    team_image string
  )
  err := connection.DB.QueryRow(`
    SELECT t.id, t.name, t.image_url, COUNT(tu.id) FROM teams AS t
    WHERE t.id = $1
    INNER JOIN team_users AS tu
    ON tu.team_id = t.id
  `).Scan(&team_id, &team_name, &team_image, &count)
  if err != nil {
    return nil, err
  }

  return &Team{team_id, team_name, team_image, count}, nil
}

# letspaint.it
Users all over the world can all paint together. Each user is allowed to submit once every second.

# Stack
- Go (Reverse Proxy Server(for fun), API Server, and Websocket)
- React/Redux + Canvas
- Redis (No eviction)
- S3 for static files

# Implementation Detail
- We will have Redis(no eviction) database to store the current state.

## Data
- consists of id, username, color (64), pixel index, and timestamp.

# TODO
- [ ] Option to create team, and have team chat
- [ ] Save Image Option

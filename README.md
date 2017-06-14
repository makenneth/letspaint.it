# letspaint.it
Users all over the world can all paint together. Each user is allowed to submit once every 30 seconds. (Not enforced yet.)

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
- [ ] benchmark compressing data with lz77
- [x] Add ssl handling in reverse proxy server
- [x] Auth (OAuth)
- [ ] Option to create team, and have team chat

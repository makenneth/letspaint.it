# letspaint.it
- Users all over the world can all paint together. Each user will be allowed to submit once every 30 seconds. (Not enforced yet.)

# Stack
- Go (Reverse Proxy Server(for fun), API Server, and Websocket)
- React/Redux + Canvas
- Redis (No eviction)

# Implementation Detail
- We will have only Redis as the main database, since we only have to store
  the current pixel state.
- We can start out with one server and a local Redis.

## Data
- Data will contain username, color, position at the grid, and timestamps.
  { timestamp: ... , username: ..., color: num, pos: { x, y } or pixelIndex }
- Currently, we allow the section of 64 colors - so it will be easier to store in redis

# TODO
- [ ] Add ssl handling in reverse proxy server
- [ ] Auth (OAuth)
- [ ] Option to create team, and have team chat

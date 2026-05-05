# CollabPoll Decisions

## Data Model

- **Room**: Represents a specific session created by a presenter. It has a `code` (e.g., `AXKF29`) which is the primary access mechanism for both audience and presenter joining a session.
- **Poll**: Belongs to a room. Contains a `question`, array of `options`, `votingMode` (single or weighted), `pointsPerUser`, and a `status` (active or closed). Only one poll can be active per room at any given time.
- **Vote**: Contains the voter's data, mapping an option to the points they assigned to it. It has a compound unique index on `(pollId, voterName)` to ensure each user can only have one vote per poll, preventing duplicate entries.

This relational approach makes it very simple to generate aggregations. When retrieving poll results, we can just aggregate `Vote` documents matching the current `pollId`.

## Real-time Architecture (Socket.IO)

- The core real-time functionality operates within **Socket.IO Rooms**. When a user connects to a Room, they are added to a specific socket room using `socket.join(roomCode)`.
- **Event Scoping**: All emission of results and poll state are scoped to the specific room (`io.to(roomCode).emit(...)`). This is a critical security and performance optimization; it ensures we aren't broadcasting database state globally.
- **Cleanups**: The application relies strictly on Socket events (`launch_poll`, `submit_vote`, `close_poll`) rather than arbitrary `setInterval` polling to maintain sync.

## Weighted Voting & Edge Cases

- **Validation**: On the backend, we validate that the points assigned exactly equal `pointsPerUser`.
- **Race conditions / Changes**: Votes are processed as **upserts** (`findOneAndUpdate` with `upsert: true`). This resolves the potential race condition of users changing votes or pressing submit multiple times rapidly. We just update their single document.
- **Late Voting**: The backend verifies `poll.status === 'active'` before processing any vote. If the presenter closes the poll, subsequent votes are rejected outright and return an error to the client.

## What I'd Change With More Time

If I had more time, I would improve the **Identity and Auth mechanism**. Currently, display names act as the sole identifier for a user. While perfectly fine for an MVP where no signup is required, this has limitations:
1. Two people entering "John" would overwrite each other's votes.
2. If a user refreshes the page, they lose the current session's validation if we don't handle local storage robustly. 

Adding an anonymous JWT or a simple UUID stored in `localStorage` would vastly improve the robustness of tracking unique voters without introducing full authentication overhead.

## What I Kept Simple (And Why)

I deliberately kept **Poll Chaining** very simple. The presenter simply clicks "Import Top N" from the previously closed poll, and the options populate into the creator form. This avoids complicated state tracking inside the DB schema itself (e.g. `parentPollId`), since the primary goal is just to start a new poll with a refined subset of options. The simplicity keeps the application snappy and the user experience straightforward.

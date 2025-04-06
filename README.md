
#  ExposeIt: Power to the People, Privacy to the Reporter

ExposeIt is a secure, anonymous citizen journalism platform that empowers users to report crimes without fear. Built with AI, blockchain, and zero-knowledge proofs, it transforms raw reports into social-media-style posts while preserving user anonymity and data integrity.



---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Framer Motion  
- **Backend:** Node.js, Express.js  
- **AI/NLP:** Gemini API, OpenMind API  
- **Auth:** Auth0  
- **Database:** MongoDB Atlas  
- **Blockchain:** Midnight (ZK-proofs)  
 

---

### Environment Variables

Create a `.env` file in both `client/` and `server/` directories with the appropriate keys:

### Install Dependencies

#### Frontend
```bash
cd client
npm install
```

#### Backend
```bash
cd server
npm install
```

```bash
cd GemIntegrate
npm install
```

---

### Run the Application

In two separate terminals:

#### Start Backend
```bash
cd server
npm start
```
> Runs on **http://localhost:5050**

```bash
cd GemIntegrate
node app.js
```
> Runs on **http://localhost:9000**

#### Start Frontend
```bash
cd client
npm start
```
> Runs on **http://localhost:3000**

---

## Features

- Anonymous AI-enhanced crime reporting
- Zero-knowledge proof-based encryption with Midnight
- Voice input and media uploads
- Reputation tracking through upvotes/downvotes
- Report forwarding to authorities via anonymous email
- Moderation powered by LLMs
- Interactive crime feed with comments and shares

---

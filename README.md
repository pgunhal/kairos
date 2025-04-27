# Kairos - Connecting the Right People at the Right Time
![Uploading Screenshot 2025-04-27 at 12.30.00 AM.png…]()

Kairos is a tool designed to automate and streamline the process of reaching out to university alumni for networking and internship opportunities. We built Kairos to help ambitious students save time and increase their success rate in the competitive job market, drawing from our own experiences navigating the CS internship landscape.

_Kai-ros: Connecting to the right people at the right time._

## Inspiration

We have faced and BEAT the brutal CS Internship Market.

After countless hours writing emails, researching contacts, and attending meetings, we managed to secure 10+ internship offers as first-year students. We realized the process could be significantly improved and wanted to build a solution to help save ambitious people like us valuable time and effort.

## What it does

Kairos automates email outreach to alumni, helping users book more calls and land more internships efficiently. Key features include:

*   **Keyword Alumni Search:** Find relevant alumni based on specific criteria.
*   **Automatic Email Outreach:** Send personalized emails to selected alumni contacts.
*   **AI Agent Replies:** Utilizes generative AI to handle initial email replies.
*   **Gen AI Calendar Invites:** Automatically suggests meeting times and sends calendar invites.

## How we built it

Our process leverages multiple data sources and a microservices architecture to deliver a seamless outreach experience.

1.  **Data Aggregation:** We pull alumni data from sources like LinkedIn and Y Combinator (specifically W25 batch), enriching it with contact information using Hunter.io.
2.  **Microservices Architecture:**
    *   **Frontend:** Built with React.
    *   **Backend:** An Express.js server acts as the central hub.
    *   **Python Services:** FastAPI hosts Python microservices for specific tasks (e.g., data enrichment, AI processing).
    *   **Node.js Services:** Additional Node.js microservices handle tasks like email sending and scheduling.
3.  **Integrations:** We integrate with various services to power our features:
    *   **Database:** MongoDB stores user and alumni data.
    *   **AI:** Gemini and OpenRouter are used for generative AI tasks (email templates, replies).
    *   **Email/Calendar:** Integrations with Gmail and Google Calendar manage email sending and scheduling.
    *   **Networking:** ngrok is used for exposing local services during development/testing.

### Tech Stack

*   **Frontend:** React
*   **Backend:** Express.js (Node.js)
*   **Microservices:** FastAPI (Python), Node.js
*   **Database:** MongoDB
*   **AI:** Google Gemini, OpenRouter
*   **APIs/Integrations:** LinkedIn, Hunter.io, Google Calendar (Gmail API), ngrok

## Challenges we ran into

We initially planned to source all alumni data from a single API. However, through trial and error, we discovered that combining multiple sources was necessary to enrich the data effectively and fill in gaps like missing email addresses or company information. Managing the complexities of integrating numerous APIs also presented a significant challenge.

## Accomplishments that we're proud of

We are incredibly proud to have built a project that we would genuinely use ourselves. Seeing the application successfully send automated, personalized emails to alumni is a major accomplishment and validates the core concept of Kairos.

WE LOVE THAT IT SENDS EMAILS TO ALUMNI !!! COME TO UCSB LINKD PLEASE!!! :)

## What we learned

This project taught us the importance of starting simple when dealing with multiple API integrations and focusing on the ones that provide the most value. We also learned (the hard way) that prioritizing good sleep significantly boosts productivity and problem-solving abilities! LOL.

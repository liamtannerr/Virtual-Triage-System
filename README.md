# Virtual Triage System

The **Virtual Triage System** is designed to support emergency departments across **British Columbia** by improving patient intake efficiency and reducing in-person wait times.

With emergency department waits often exceeding **8 hours** in BC, this system enables patients to remotely submit their symptoms to a triage nurse, who then assigns a priority level and places them in a **virtual queue**. Patients can remain at home while they await availability, and monitor **real-time wait times** for emergency departments in their region.

## Run the current application

The application now uses a fresh MongoDB database, Argon2 password hashing, expiring cookie sessions, and backend role/record access checks. See [local setup, staff accounts, and security details](docs/SECURITY_AND_SETUP.md).

The frontend uses React + Vite; the backend uses FastAPI + PyMongo. MongoDB can run locally with Docker Compose, with a separate new Atlas instance configured for future deployment.

## Key Features

- Remote symptom submission and triage by a qualified nurse  
- Virtual queue generation to manage patient flow  
- Real-time tracking of emergency department wait times  
- Optimized for use in high-demand healthcare environments  

## Technologies Used

- **React.js** for the front-end user interface  
- **FastAPI** and **Python** for backend services and API development  
- **Bootstrap** for responsive UI components  
- **GitHub** for version control and collaboration  
- **Agile** methodologies, including iterative development and sprint planning  
- **UML Diagrams** and **development patterns** to model system behavior and architecture

## Project Team

Developed by a cross-functional team as part of an Agile software development course. The project followed **industry-standard practices** including code reviews, feature planning, and iterative sprint cycles.

## Future Work

Future enhancements may include:

- Integration with hospital databases and EMR systems  
- Automated triage recommendations using AI/ML models  
- Full deployment to a cloud-based infrastructure for scalability  

## License

This project was developed for **educational purposes only** and is not currently intended for clinical or production use.

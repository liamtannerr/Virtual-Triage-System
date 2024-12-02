import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';


const NurseWaiting = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [priority, setPriority] = useState(1);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('user_type') != 2) {
      setShow(true);
    }
  }, []);

  const handleHomepage = () => {
    navigate('/');
  }

  const handleLogin = () => {
    navigate('/login');
  }

  const createMedicalTicket = () => {
    if (!selectedTicket) {
        console.error("No ticket selected.");
        return;
    }

    const medicalTicket = {
        VTticketID: selectedTicket.ticketID,
        priority: parseInt(priority, 10), // Ensure priority is an integer
        startTime: new Date().toISOString(), // Use ISO string format for dates
    };

    console.log("Medical Ticket Payload:", medicalTicket);

    // Submit the medical ticket
    axios.post('http://localhost:8000/medical/ticket', medicalTicket)
        .then(response => {
            console.log("Ticket created:", response.data);
            // Update the currentLoad of the department
            axios.put(
              `http://localhost:8000/emergency/department/${selectedTicket.ED}/currentLoad`,
              { increment: 1 },
              { headers: { "Content-Type": "application/json" } }
          )
            .then(loadResponse => {
                console.log("Department load updated:", loadResponse.data);
            })
            .catch(loadError => {
                console.error("Error updating department load:", loadError.response?.data || loadError.message);
            });

            // Clear the selected ticket
            setSelectedTicket(null);
        })
        .catch(error => {
            console.error("Error creating ticket:", error.response?.data || error.message);
        });
};

  useEffect(() => {
    axios.get('http://localhost:8000/triage/tickets')
      .then(response => {
        setTickets(response.data);
        setLoading(false);
      })
      .catch(error => console.error("Error fetching tickets:", error));
  }, []);

  const renderSymptoms = (symptoms) => (
    <div>
      {Object.entries(symptoms).map(([symptom, value]) => (
        <Row>
          <Col key={symptom}>
            {symptom}: {value ? "Yes" : "No"}
          </Col>
        </Row>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="patient-waiting" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
        <h1>Nurse Waiting Screen</h1>
        <p>Please wait for incoming patient triage forms.</p>
        <ClipLoader color="#3498db" loading={true} size={150} />
      </div>
    );
  }

  if (selectedTicket) {
    return (
      <Form>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
      <h1>Ticket Details</h1>
      <div style={{
      border: '1px solid #ccc',
      padding: '20px',
      borderRadius: '5px',
      backgroundColor: '#f9f9f9',
      width: '80%',
      textAlign: 'center',
      transition: 'transform 0.2s, background-color 0.2s',
      }}>
        <h2>{selectedTicket.user}</h2>
      <p><strong>Ticket ID:</strong> {selectedTicket.ticketID}</p>
      <p><strong>Emergency Department:</strong> {selectedTicket.ED === 1 ? 'Royal Jubilee Hospital' : selectedTicket.ED === 2 ? 'Victoria General Hospital' : selectedTicket.ED}</p>
      <p><strong>Duration of Symptoms:</strong> {selectedTicket.durationOfSymptoms}</p>
      <p><strong>Allergies:</strong> {Array.isArray(selectedTicket.listAllergies) ? selectedTicket.listAllergies.join(', ') : selectedTicket.listAllergies}</p>
      <p><strong>Past Medical Conditions:</strong> {Array.isArray(selectedTicket.pastMedicalConditions) ? selectedTicket.pastMedicalConditions.join(', ') : selectedTicket.pastMedicalConditions}</p>

      <h3>General Symptoms</h3>
      {renderSymptoms(selectedTicket.generalSymptoms)}

      <h3>Respiratory Symptoms</h3>
      {renderSymptoms(selectedTicket.respiratorySymptoms)}

      <h3>Gastrointestinal Symptoms</h3>
      {renderSymptoms(selectedTicket.gastrointestinalSymptoms)}

      <h3>Neurological Symptoms</h3>
      {renderSymptoms(selectedTicket.neurologicalSymptoms)}

      <h3>Musculoskeletal Symptoms</h3>
      {renderSymptoms(selectedTicket.musculoskeletalSymptoms)}

      <h3>Cardiovascular Symptoms</h3>
      {renderSymptoms(selectedTicket.cardiovascularSymptoms)}

      <h3>Skin Symptoms</h3>
      {renderSymptoms(selectedTicket.skinSymptoms)}

      <h3>Psychological Symptoms</h3>
      {renderSymptoms(selectedTicket.psychologicalSymptoms)}

      <h3>Substance Habits</h3>
      {renderSymptoms(selectedTicket.substanceHabits)}

      <p><strong>Consent:</strong> {selectedTicket.consent ? "Yes" : "No"}</p>
      <p><strong>Timestamp:</strong> {new Date(selectedTicket.timestamp).toLocaleString()}</p>

      <p><strong>Select the priority:</strong></p>
      <Form.Select value={ priority } onChange={ (e) => setPriority( e.target.value ) }>
        <option value="1">Immediate Life Threat</option>
        <option value="2">Critical - Very High Priority</option>
        <option value="3">High Priority - Urgent</option>
        <option value="4">Subacute - Moderately Urgent</option>
        <option value="5">Moderate Priority</option>
        <option value="6">Low Priority - Stable</option>
        <option value="7">Very Low Priority</option>
        <option value="8">Minimal Priority</option>
        <option value="9">Non-Urgent</option>
        <option value="10">No Emergency</option>
      </Form.Select>
      <Button onClick={createMedicalTicket} style={{ marginTop: '20px' }}>Submit Ticket</Button>
      <Button variant="secondary" onClick={() => setSelectedTicket(null)} style={{ marginTop: '20px', marginLeft: '10px' }}>Back</Button>
      </div>
      </div>
      </Form>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Incoming Triage Tickets</h1>
      <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tickets.map(ticket => (
          <div key={ticket.ticketID} style={{
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setSelectedTicket(ticket)}
          >
            <strong>{ticket.user}</strong>
            <div style={{ fontSize: '0.8em', color: '#555' }}>{new Date(ticket.timestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <Modal
        show={show}
        onHide={handleLogin}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Unauthorized</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You aren't allowed to access this page.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleHomepage}>
            Return to Homepage
          </Button>
          <Button variant="primary" onClick={handleLogin}>
            Login
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NurseWaiting;

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';


const DoctorWaiting = () => {
  const [medicalTickets, setMedicalTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    axios.get('http://localhost:8000/medical/tickets')
      .then(response => {
        setMedicalTickets(response.data);
        setLoading(false);
      })
      .catch(error => console.error("Error fetching medical tickets:", error));
  }, []);

  useEffect(() => {
    if (localStorage.getItem('user_type') != 3) {
      setShow(true);
    }
  }, []);

  const renderSymptoms = (symptoms) => (
    <div>
      {Object.entries(symptoms).map(([symptom, value]) => (
        <Row key={symptom}>
          <Col>
            {symptom}: {value ? "Yes" : "No"}
          </Col>
        </Row>
      ))}
    </div>
  );

  const handleMedicalTicket = () => {
    axios.delete(`http://localhost:8000/medical/tickets/${selectedTicket.VTticketID}`)
      .then(response => {        
        axios.put(
        `http://localhost:8000/emergency/department/${selectedTicket.ED}/currentLoad`,
        { increment: -1 },
        { headers: { "Content-Type": "application/json" } }
      )
        .then(loadResponse => {
          console.log("Department load updated:", loadResponse.data);
        })
        .catch(loadError => {
          console.error("Error updating department load:", loadError.response?.data || loadError.message);
        });
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
      });
    setSelectedTicket(null);
  }

  if (loading) {
    return <div>Loading...</div>;
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
            <h3>Priority: {selectedTicket.priority}</h3>
            <p><strong>Ticket ID:</strong> {selectedTicket.VTTicket.ticketID}</p>
            <p><strong>User:</strong> {selectedTicket.VTTicket.user}</p>
            <p><strong>Emergency Department:</strong> {selectedTicket.VTTicket.ED}</p>
            <p><strong>Duration of Symptoms:</strong> {selectedTicket.VTTicket.durationOfSymptoms}</p>
            <p><strong>Allergies:</strong> {Array.isArray(selectedTicket.VTTicket.listAllergies) ? selectedTicket.VTTicket.listAllergies.join(', ') : selectedTicket.VTTicket.listAllergies}</p>
            <p><strong>Past Medical Conditions:</strong> {Array.isArray(selectedTicket.VTTicket.pastMedicalConditions) ? selectedTicket.VTTicket.pastMedicalConditions.join(', ') : selectedTicket.VTTicket.pastMedicalConditions}</p>

            <h3>General Symptoms</h3>
            {renderSymptoms(selectedTicket.VTTicket.generalSymptoms || {})}

            <h3>Respiratory Symptoms</h3>
            {renderSymptoms(selectedTicket.VTTicket.respiratorySymptoms || {})}

            <h3>Gastrointestinal Symptoms</h3>
            {renderSymptoms(selectedTicket.VTTicket.gastrointestinalSymptoms || {})}

            <h3>Neurological Symptoms</h3>
            {renderSymptoms(selectedTicket.VTTicket.neurologicalSymptoms || {})}

            <h3>Musculoskeletal Symptoms</h3>
            {renderSymptoms(selectedTicket.VTTicket.musculoskeletalSymptoms || {})}

            <h3>Cardiovascular Symptoms</h3>
            {renderSymptoms(selectedTicket.VTTicket.cardiovascularSymptoms || {})}

            <h3>Skin Symptoms</h3>
            {renderSymptoms(selectedTicket.VTTicket.skinSymptoms || {})}

            <h3>Psychological Symptoms</h3>
            {renderSymptoms(selectedTicket.VTTicket.psychologicalSymptoms || {})}

            <h3>Substance Habits</h3>
            {renderSymptoms(selectedTicket.VTTicket.substanceHabits || {})}

            <p><strong>Consent:</strong> {selectedTicket.VTTicket.consent ? "Yes" : "No"}</p>
            <p><strong>Timestamp:</strong> {new Date(selectedTicket.VTTicket.timestamp).toLocaleString()}</p>

            <Button variant="primary" onClick={handleMedicalTicket} style={{ marginTop: '20px', marginLeft: '10px' }}>See Patient</Button>
            <Button variant="secondary" onClick={() => setSelectedTicket(null)} style={{ marginTop: '20px', marginLeft: '10px' }}>Back</Button>
          </div>
        </div>
      </Form>
    );
  }

  const handleHomepage = () => {
    navigate('/');
  }

  const handleLogin = () => {
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
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
      <h1 style={{ marginBottom: '20px' }}>Medical Tickets</h1>
      <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {medicalTickets.sort((a, b) => a.priority - b.priority)
          .map(ticket => (
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
              <strong>{ticket.VTTicket.patient}</strong>
              <div style={{ fontSize: '0.8em', color: '#555' }}>
                Priority: {ticket.priority}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DoctorWaiting;

import React, { useEffect, useState } from 'react';

const NurseWaiting = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    // Hardcoded sample data
    const sampleTickets = [
      { id: 1, patientName: 'John Doe', timestamp: '2023-10-01 10:00 AM'},
      { id: 2, patientName: 'Jane Smith', timestamp: '2023-10-01 10:05 AM'},
      { id: 3, patientName: 'Isaac Northrop', timestamp: '2023-10-01 10:10 AM'},
      { id: 4, patientName: 'Ashley Mcpherson', timestamp: '2023-10-01 10:15 AM'},
      { id: 5, patientName: 'Erich Rueben', timestamp: '2023-10-01 10:20 AM'},
      { id: 6, patientName: 'Ben Towers', timestamp: '2023-10-01 10:25 AM'},
      { id: 7, patientName: 'Abby Baker', timestamp: '2023-10-01 10:30 AM'},
      { id: 8, patientName: 'Taylor Hall', timestamp: '2023-10-01 10:35 AM'},
      { id: 9, patientName: 'Brody Oday', timestamp: '2023-10-01 10:40 AM'},
    ];
    setTickets(sampleTickets);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (selectedTicket){
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px'}}>
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
                <strong> {selectedTicket.patientName} </strong>
                <div style={{fontSize: '0.8em', color: '#555'}}>{selectedTicket.timestamp}</div>
                <button onClick={() =>
                    setSelectedTicket(null)} style= {{ marginTop: '20px'}}>Back</button>
                    </div>
                </div>        
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <h1 style={{ marginBottom: '20px'}}>Incoming Triage Tickets</h1>
      <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tickets.map(ticket => (
          <div key={ticket.id} style={{ 
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
            transition: 'transform 0.2s', 
            cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)'
                }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
            }}
            onClick={() => setSelectedTicket(ticket)}
            >
            <strong>{ticket.patientName}</strong>
            <div style={{ fontSize: '0.8em', color: '#555' }}>{ticket.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NurseWaiting;
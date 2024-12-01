import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

const PatientWaiting = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('inTriage') !== 1) {
            navigate('/');
        }
    }, []);

    return (
        <div className="patient-waiting" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
            <h1>Waiting Room</h1>
            <p>Please wait for a healthcare professional to assess your triage.</p>
            <ClipLoader color="#3498db" loading={true} size={150} />
        </div>
    );
};

export default PatientWaiting;
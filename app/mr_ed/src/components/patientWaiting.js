import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { Button } from 'react-bootstrap';
import axios from 'axios';

const PatientWaiting = () => {
    const navigate = useNavigate();
    const [medicalTickets, setMedicalTickets] = useState([]);
    const [triageStatus, setTriageStatus] = useState("submitted");
    const [index, setIndex] = useState(0);

    const handleAccept = () => {
        axios
            .put(
                'http://localhost:8000/auth/user',
                {
                    inTriage: "false",
                    user_email: localStorage.email
                },
                { headers: { "Content-Type": "application/json" } })
            .then((response) => {
                localStorage.inTriage = false;
                navigate("/");
            })
            .catch((error) => {
                console.error(error);
            });
    }

    useEffect(() => {
        if (localStorage.inTriage == "false" || localStorage.user_type != 1) {
            navigate('/');
        }
        axios.get('http://localhost:8000/medical/tickets')
            .then(response => {
                setMedicalTickets(prevTickets => {
                    if (response.data.some(ticket => ticket.VTTicket.email === localStorage.email)) {
                        setTriageStatus("reviewed");
                        setIndex(response.data.findIndex(ticket => ticket.VTTicket.email === localStorage.email) + 1);
                    }
                    return response.data;
                });
            })
            .catch(error => console.error("Error fetching medical tickets:", error));
        const intervalId = setInterval(() => {
            axios.get('http://localhost:8000/medical/tickets')
                .then(response => {
                    setMedicalTickets(prevTickets => {
                        if (response.data.some(ticket => ticket.VTTicket.email === localStorage.email)) {
                            setTriageStatus("reviewed");
                            setIndex(response.data.findIndex(ticket => ticket.VTTicket.email === localStorage.email) + 1);
                        }
                        return response.data;
                    });
                })
                .catch(error => console.error("Error fetching medical tickets:", error));

            axios.get('http://localhost:8000/auth/user',
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                })
                .then(response => {
                    const { email, token, user_type, name, inTriage } = response.data;
                    if (inTriage == "doctor")
                        setTriageStatus("ready")
                    if (inTriage == "rejected")
                        setTriageStatus("rejected")
                })
                .catch(error => console.error("Error fetching medical tickets:", error));

        }, 10 * 1000);

        return () => clearInterval(intervalId);

    }, []);

    const PatientStatus = ({ triageStatus }) => {
        return (
            <div className="patient-waiting" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
                {triageStatus === "submitted" && (
                    <>
                        <h1>Waiting Room</h1>
                        <p>Please wait for a nurse to review your triage.</p>
                        <ClipLoader color="#3498db" loading={true} size={150} />
                    </>
                )}
                {triageStatus === "reviewed" && (
                    <>
                        <h1>Waiting Room</h1>
                        <p>You are number {index} in line.</p>
                        <ClipLoader color="#3498db" loading={true} size={150} />
                    </>
                )}
                {triageStatus === "ready" && (
                    <>
                        <h1>Waiting Room</h1>
                        <p>The doctor is ready to see you.</p>
                        <Button variant="primary" onClick={handleAccept}>Accept</Button>
                    </>
                )}
                {triageStatus === "rejected" && (
                    <>
                        <h1>Waiting Room</h1>
                        <p>Please do not come to the hospital.</p>
                        <Button variant="primary" onClick={handleAccept}>Accept</Button>
                    </>
                )}
            </div>
        )
    }

    return (
        <PatientStatus triageStatus={triageStatus} />
    );
};

export default PatientWaiting;
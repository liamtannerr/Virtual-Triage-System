import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import '../styles/Homepage.css';

function Homepage() {
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8000/emergency/department', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then((response) => {
            const updatedDepartments = response.data.map((department) => {
                const waitTimeMinutes = department.currentLoad * 15;
                const waitTime = `${Math.floor(waitTimeMinutes / 60)
                    .toString()
                    .padStart(2, '0')}:${(waitTimeMinutes % 60)
                    .toString()
                    .padStart(2, '0')}`;
                return {
                    ...department,
                    waitTime,
                };
            });
            setDepartments(updatedDepartments);
        })
        .catch((error) => {
            console.error(error);
            setError("Could not load departments.");
        });
    }, []);

    return (
        <Container fluid>
            <Row>
                <Col>
                    <h1 className="text-center">Mr Ed</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>Department Wait Times</h2>
                </Col>
            </Row>
            {error && (
                <Row>
                    <Col>
                        <p className="text-danger">{error}</p>
                    </Col>
                </Row>
            )}
            <Row className="card-list">
                <Col>
                    {departments.map((department) => (
                        <Card key={department.establishmentID}>
                            <Card.Title className="d-flex justify-content-between">
                                <span>{department.name}</span>
                                <span className="wait-time">{department.waitTime} hrs</span>
                            </Card.Title>
                            <Card.Body>{department.address}</Card.Body>
                        </Card>
                    ))}
                </Col>
            </Row>
        </Container>
    );
}

export default Homepage;
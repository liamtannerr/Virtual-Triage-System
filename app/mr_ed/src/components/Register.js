import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const handleRegister = () => {
        // Send registration request to the backend
        axios
            .post('http://localhost:8000/register', { username, email, password })
            .then(response => {
                setMessage(response.data.message);
                const { username, email, token } = response.data;
                localStorage.setItem('username', username);
                localStorage.setItem('email', email);
                localStorage.setItem('token', token);
                // Redirect to homepage using navigate
                navigate('/'); // Replace '/' with the homepage URL if needed
            })
            .catch(error => {
                console.error(error);
                setMessage('Error registering. Please try again.');
            });
    };
    return (
        <div>
            <Container>
                <Row>
                    <Col>
                        <h1 class="text-center">Login</h1>
                    </Col>
                </Row>
            </Container>
            <div>
                <Container>
                    <Row>
                        <Col>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    placeholder="Username"
                                    aria-label="Username"
                                    aria-describedby="basic-addon1"
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    placeholder="Password"
                                    aria-label="Password"
                                    aria-describedby="basic-addon1"
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
                <Button variant="light" onClick={handleRegister} >Register</Button>{' '}
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}
export default Register;
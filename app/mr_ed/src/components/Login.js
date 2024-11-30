import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const handleLogin = () => {
        // Send login request to the backend
        axios
            .post('http://localhost:8000/auth/login', { email, password })
            .then(response => {
                setMessage(response.data.message);
                console.log(response)
                const { email, token, user_type } = response.data;
                localStorage.setItem('email', email);
                localStorage.setItem('token', token);
                localStorage.setItem('user_type', user_type);
                if(user_type === 1){
                    navigate('/');
                }
                else if(user_type === 2){
                    navigate('/nurseWaiting');
                }
                else if(user_type === 3){
                    navigate('/'); // put doctorWaiting             
                }
            })
            .catch(error => {
                console.error(error);
                setMessage('Error logging in. Please try again.');
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
                                    placeholder="Email"
                                    aria-label="Email"
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
                <Button variant="light" onClick={handleLogin} >Login</Button>{' '}
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}
export default Login;
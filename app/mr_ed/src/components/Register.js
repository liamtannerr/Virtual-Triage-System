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
    const [name, setName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState({
        male: false,
        female: false,
        preferNotToSay: false,
    });
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [country, setCountry] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [healthNumber, setHealthNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [userType, setUserType] = useState(1);

   
    const handleRegister = () => {
        // Send registration request to the backend
        axios
            .post('http://localhost:8000/auth/register', { name, dateOfBirth, gender, streetAddress, city, province, country, postalCode, healthNumber, email, password, userType})
            .then(response => {
                setMessage(response.data.message);
                const { email, token } = response.data;
                localStorage.setItem('email', email);
                localStorage.setItem('token', token);
                // Redirect to homepage using navigate
                navigate('/'); // Replace '/' with the homepage URL if needed
            })
            .catch(error => {
                console.error(error);
                setMessage(error.response?.data?.detail || 'Error registering. Please try again.');
            });
    };

    return (
        <div>
            <Container>
                <Row>
                    <Col>
                        <h1 class="text-center">Create Account</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h2 className="mt-4 fs-5">Enter Personal Information:</h2> {/* Adds a heading with top margin */}
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
                                    placeholder="Full Name"
                                    aria-label="Full Name"
                                    aria-describedby="basic-addon1"
                                    onChange={e => setName(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    placeholder="Date of Birth (YYYY-MM-DD)"
                                    aria-label="Date of Birth (YYYY-MM-DD)"
                                    aria-describedby="basic-addon1"
                                    onChange={e => setDateOfBirth(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className="align-items-center mb-3">
                        <Col xs="auto" className="d-flex align-items-center justify-content-center">
                            <h2 className="fs-6">Gender:</h2>
                        </Col>
                        <Col>
                            <Form.Check
                                inline
                                type="radio"
                                label="Male"
                                name="gender"
                                value="Male"
                                checked={gender === 'Male'}
                                onChange={() => setGender('Male')}
                            />
                    
                            <Form.Check
                                inline
                                type="radio"
                                label="Female"
                                name="gender"
                                value="Female"
                                checked={gender === 'Female'}
                                onChange={() => setGender('Female')}
                            />
                  
                            <Form.Check
                                inline
                                type="radio"
                                label="Prefer not to say"
                                name="gender"
                                value="Prefer not to say"
                                checked={gender === 'Prefer not to say'}
                                onChange={() => setGender('Prefer not to say')}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    placeholder="Street Address"
                                    aria-label="Street Address"
                                    aria-describedby="basic-addon1"
                                    onChange={e => setStreetAddress(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    placeholder="City"
                                    aria-label="City"
                                    aria-describedby="basic-addon1"
                                    onChange={e => setCity(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    placeholder="Province"
                                    aria-label="Province"
                                    aria-describedby="basic-addon1"
                                    onChange={e => setProvince(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    placeholder="Country"
                                    aria-label="Country"
                                    aria-describedby="basic-addon1"
                                    onChange={e => setCountry(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    placeholder="Postal Code"
                                    aria-label="Postal Code"
                                    aria-describedby="basic-addon1"
                                    onChange={e => setPostalCode(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    placeholder="Health Number"
                                    aria-label="Health Number"
                                    aria-describedby="basic-addon1"
                                    onChange={e => setHealthNumber(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    {/* Heading for Create Login Credentials */}
                    <Row>
                        <Col>
                            <h2 className="mt-4 fs-5">Create Login Credentials:</h2> {/* Adds a heading with top margin */}
                        </Col>
                    </Row>

                    <Row className="mt-2">
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
                <Button variant="light" onClick={handleRegister} >Create Account</Button>{' '}
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}
export default Register;
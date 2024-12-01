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


    const validateFields = () => {
        const nameRegex = /^[A-Za-z]+ [A-Za-z]+$/;
        const dobRegex = /^\d{4}\/\d{2}\/\d{2}$/;
        const postalCodeRegex = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/;
        const healthNumberRegex = /^\d{9}$/;
        const emailRegex = /.+@.+\..+/;
        const alphabetAndSpacesRegex = /^[A-Za-z\s]+$/; 
    
        if (!name) {
            setMessage("Name is required.");
            return false;
        }
        if (!nameRegex.test(name)) {
            setMessage("Name should contain only alphabetical letters. First and last name should be provided.");
            return false;
        }
        if (!dateOfBirth) {
            setMessage("Date of Birth is required.");
            return false;
        }
        if (!dobRegex.test(dateOfBirth)) {
            setMessage("Date of Birth must be in the format YYYY/MM/DD with a valid year, month, and day.");
            return false;
        }
        const [year, month, day] = dateOfBirth.split('/').map(Number);

        // Year check
        if (year > 2024) {
            setMessage("Year must before 2024.");
            return false;
        }

        // Month check
        if (month < 1 || month > 12) {
            setMessage("Month must be between 01 and 12.");
            return false;
        }

        // Day check
        if (day < 1 || day > 31) {
            setMessage("Day must be between 01 and 31.");
            return false;
        }
        if (!gender) {
            setMessage("Please select a gender.");
            return false;
        }
        if (!streetAddress) {
            setMessage("Street Address is required.");
            return false;
        }
        if (!city) {
            setMessage("City is required.");
            return false;
        }
        if (!alphabetAndSpacesRegex.test(city)) {
            setMessage("City should contain only alphabetical letters.");
            return false;
        }
        if (!province) {
            setMessage("Province is required.");
            return false;
        }
        if (!alphabetAndSpacesRegex.test(province)) {
            setMessage("Province should contain only alphabetical letters.");
            return false;
        }
        if (!country) {
            setMessage("Country is required.");
            return false;
        }
        if (!alphabetAndSpacesRegex.test(country)) {
            setMessage("Country should contain only alphabetical letters.");
            return false;
        }
        if (!postalCode) {
            setMessage("Postal Code is required.");
            return false;
        }
        if (!postalCodeRegex.test(postalCode)) {
            setMessage("Postal Code must be in the format A1A 1A1.");
            return false;
        }
        if (!healthNumber) {
            setMessage("Health Number is required.");
            return false;
        }
        if (!healthNumberRegex.test(healthNumber)) {
            setMessage("Health Number must be exactly 9 digits.");
            return false;
        }
        if (!email) {
            setMessage("Email is required.");
            return false;
        }
        if (!emailRegex.test(email)) {
            setMessage("Email must contain an '.' and '@'.");
            return false;
        }
        if (!password) {
            setMessage("Password is required.");
            return false;
        }
        return true;
    };
   
    const handleRegister = () => {
        if (!validateFields()) return;
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
                                    placeholder="Date of Birth (YYYY/MM/DD)"
                                    aria-label="Date of Birth (YYYY/MM/DD)"
                                    aria-describedby="basic-addon1"
                                    onChange={e => setDateOfBirth(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className="align-items-center mb-3">
                        <Col xs="auto">
                            <span className="fs-6">Gender:</span>
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
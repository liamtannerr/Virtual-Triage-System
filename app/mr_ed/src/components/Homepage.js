import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Homepage() {
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        // Fetch user data from the API endpoint
        fetch('http://localhost:8000/api/user', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(response => response.json())
            .then(data => setUserData(data))
            .catch(error => console.error(error));
    }, []);
    const email = localStorage.getItem('email');
    return (
        <div>
            <Container>
                <Row>
                    <Col>
                        <h1 class="text-center">Welcome to Mr. Ed</h1>
                    </Col>
                </Row>
            </Container>
            {userData && (
                <p>
                    Welcome {email} to the homepage!
                </p>
            )}
        </div>
    );
}
export default Homepage;
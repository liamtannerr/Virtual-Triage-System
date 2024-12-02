import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import '../styles/EDNavbar.css'

function EDNavbar() {
    return (
        <Navbar expand="lg">
        <Container>
          <Navbar.Brand href="#home"></Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">Home</Nav.Link>
              <Nav.Link href="/login">Login</Nav.Link>
              <Nav.Link href="/register">Register</Nav.Link>
              <Nav.Link href="/patientWaiting">Patient Waiting</Nav.Link>
              <Nav.Link href="/nurseWaiting">Nurse Waiting</Nav.Link>
              <Nav.Link href="/enter">Enter Virtual Triage</Nav.Link>
              <Nav.Link href="/doctorWaiting">Doctor Waiting</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
}
export default EDNavbar;
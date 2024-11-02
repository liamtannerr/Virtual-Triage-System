import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

function EnterVirtualTriage() {
    return (
        <div>
            <Container>
                <Row>
                    <Col>
                        <h1 class="text-center">Enter Virtual Triage</h1>
                    </Col>
                </Row>
            </Container>
            <div>
                <Container>
                    <Row className="py-3">
                        <p>Please check all the symptoms you're currently experiencing:</p>
                        <Col>
                            <p>General Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='fever-checkbox'
                                label='Fever'
                            />
                            <Form.Check
                                type='checkbox'
                                id='chills-checkbox'
                                label='Chills'
                            />
                            <Form.Check
                                type='checkbox'
                                id='fatigue-checkbox'
                                label='Fatigue'
                            />
                            <Form.Check
                                type='checkbox'
                                id='weakness-checkbox'
                                label='Weakness'
                            />
                            <Form.Check
                                type='checkbox'
                                id='weight-loss-checkbox'
                                label='Weight loss or gain'
                            />
                            <Form.Check
                                type='checkbox'
                                id='night-sweats-checkbox'
                                label='Night sweats'
                            />
                        </Col>
                        <Col>
                            <p>Respiratory Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='cough-checkbox'
                                label='Cough (dry or productive)'
                            />
                            <Form.Check
                                type='checkbox'
                                id='shortness-breath-checkbox'
                                label='Shortness of breath'
                            />
                            <Form.Check
                                type='checkbox'
                                id='wheezing-checkbox'
                                label='Wheezing'
                            />
                            <Form.Check
                                type='checkbox'
                                id='sore-throat-checkbox'
                                label='Sore throat'
                            />
                            <Form.Check
                                type='checkbox'
                                id='nasal-congestion-checkbox'
                                label='Nasal congestion or runny nose'
                            />
                            <Form.Check
                                type='checkbox'
                                id='chest-pain-checkbox'
                                label='Chest pain'
                            />
                        </Col>
                        <Col>
                            <p>Gastrointestinal Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='nausea-checkbox'
                                label='Nausea'
                            />
                            <Form.Check
                                type='checkbox'
                                id='vomiting-checkbox'
                                label='Vomiting'
                            />
                            <Form.Check
                                type='checkbox'
                                id='diarrhea-checkbox'
                                label='Diarrhea'
                            />
                            <Form.Check
                                type='checkbox'
                                id='constipation-checkbox'
                                label='Constipation'
                            />
                            <Form.Check
                                type='checkbox'
                                id='abdominal-pain-checkbox'
                                label='Abdominal pain or cramps'
                            />
                            <Form.Check
                                type='checkbox'
                                id='loss-appetite-checkbox'
                                label='Loss of appetite'
                            />
                        </Col>
                        <Col>
                            <p>Neurological Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='headache-checkbox'
                                label='Headache'
                            />
                            <Form.Check
                                type='checkbox'
                                id='dizziness-checkbox'
                                label='Dizziness or lightheadedness'
                            />
                            <Form.Check
                                type='checkbox'
                                id='numbness-checkbox'
                                label='Numbness or tingling'
                            />
                            <Form.Check
                                type='checkbox'
                                id='confusion-checkbox'
                                label='Confusion'
                            />
                            <Form.Check
                                type='checkbox'
                                id='memory-loss-checkbox'
                                label='Memory loss'
                            />
                            <Form.Check
                                type='checkbox'
                                id='seizures-checkbox'
                                label='Seizures'
                            />
                        </Col>
                    </Row>
                    <Row className="py-3">
                        <Col>
                            <p>Musculoskeletal Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='joint-pain-checkbox'
                                label='Joint pain or swelling'
                            />
                            <Form.Check
                                type='checkbox'
                                id='muscle-pain-checkbox'
                                label='Muscle pain or cramps'
                            />
                            <Form.Check
                                type='checkbox'
                                id='stiffness-checkbox'
                                label='Stiffness'
                            />
                            <Form.Check
                                type='checkbox'
                                id='back-pain-checkbox'
                                label='Back pain'
                            />
                        </Col>
                        <Col>
                            <p>Cardiovascular Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='palpitations-checkbox'
                                label='Palpitations'
                            />
                            <Form.Check
                                type='checkbox'
                                id='swelling-checkbox'
                                label='Swelling in the legs or ankles'
                            />
                            <Form.Check
                                type='checkbox'
                                id='heart-chest-pain-checkbox'
                                label='Chest pain or discomfort'
                            />
                            <Form.Check
                                type='checkbox'
                                id='fast-heartrate-checkbox'
                                label='Fast heartrate'
                            />
                        </Col>
                        <Col>
                            <p>Skin Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='rash-checkbox'
                                label='Rash'
                            />
                            <Form.Check
                                type='checkbox'
                                id='itching-checkbox'
                                label='Itching'
                            />
                            <Form.Check
                                type='checkbox'
                                id='skin-changes-checkbox'
                                label='Changes in skin color'
                            />
                            <Form.Check
                                type='checkbox'
                                id='wounds-checkbox'
                                label='Wounds or sores'
                            />
                        </Col>
                        <Col>
                            <p>Pyschological Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='anxiety-checkbox'
                                label='Anxiety'
                            />
                            <Form.Check
                                type='checkbox'
                                id='depression-checkbox'
                                label='Depression'
                            />
                            <Form.Check
                                type='checkbox'
                                id='mood-swings-checkbox'
                                label='Mood swings'
                            />
                            <Form.Check
                                type='checkbox'
                                id='sleep-changes-checkbox'
                                label='Changes in sleep patterns'
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    aria-label="symptom-duration"
                                    aria-describedby="basic-addon1"
                                    placeholder="Duration of Symptoms"
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    aria-label="allergies"
                                    aria-describedby="basic-addon1"
                                    placeholder="List any allergies."
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    aria-label="past-medical-conditions"
                                    aria-describedby="basic-addon1"
                                    placeholder="Past Medical Conditions"
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>Do you smoke?</p>
                            <Form.Check
                                type='radio'
                                id='yes-smoke-checkbox'
                                label='Yes'
                            />
                            <Form.Check
                                type='radio'
                                id='no-smoke-checkbox'
                                label='No'
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>Do you consume alcohol?</p>
                            <Form.Check
                                type='radio'
                                id='yes-alcohol-checkbox'
                                label='Yes'
                            />
                            <Form.Check
                                type='radio'
                                id='no-alcohol-checkbox'
                                label='No'
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>Do you use drugs?</p>
                            <Form.Check
                                type='radio'
                                id='yes-drugs-checkbox'
                                label='Yes'
                            />
                            <Form.Check
                                type='radio'
                                id='no-drugs-checkbox'
                                label='No'
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>I consent to the collection of my personal and medical information as described.</p>
                            <Form.Check
                                type='radio'
                                id='yes-drugs-checkbox'
                                label='Yes'
                            />
                            <Form.Check
                                type='radio'
                                id='no-drugs-checkbox'
                                label='No'
                            />
                        </Col>
                    </Row>
                </Container>
                <Button variant="light" >Enter</Button>{' '}
            </div>
        </div>
    );
}
export default EnterVirtualTriage;
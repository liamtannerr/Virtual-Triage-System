import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';

function EnterVirtualTriage() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [symptoms, setSymptoms] = useState({
        fever: false,
        chills: false,
        fatigue: false,
        weakness: false,
        weightChange: false,
        nightSweats: false,
        cough: false,
        shortnessOfBreath: false,
        wheezing: false,
        soreThroat: false,
        nasalCongestion: false,
        chestPain: false,
        nausea: false,
        vomiting: false,
        diarrhea: false,
        constipation: false,
        abdominalPain: false,
        lossOfAppetite: false,
        headache: false,
        dizziness: false,
        numbness: false,
        confusion: false,
        memoryLoss: false,
        seizures: false,
        jointPain: false,
        musclePain: false,
        stiffness: false,
        backPain: false,
        palpitations: false,
        chestDiscomfort: false,
        swelling: false,
        fastHeartrate: false,
        rash: false,
        itching: false,
        skinColorChange: false,
        wounds: false,
        anxiety: false,
        depression: false,
        moodSwings: false,
        sleepChanges: false,
        allergies: '',
        duration: '',
        pastMedical: '',
        smoke: false,
        alcohol: false,
        drugs: false,
        consent: false,
        emergencyDepartment: "Select the emergency department you'd like to attend",
    });

    const handleSymptomChange = (event) => {
        const { id, checked } = event.target
        setSymptoms(prevState => ({
            ...prevState,
            [id]: checked,
        }));
    };

    const handleRadio = (event, button) => {
        const { id } = event.target
        if (button === 'Yes') {
            setSymptoms(prevState => ({
                ...prevState,
                [id]: true,
            }));
        } else {
            setSymptoms(prevState => ({
                ...prevState,
                [id]: false,
            }));
        }
    };

    const handleTextChange = (event) => {
        const { id, value } = event.target
        setSymptoms(prevState => ({
            ...prevState,
            [id]: value,
        }));
    };

    const handleDropdown = (event, value) => {
        const { id } = event.target
        setSymptoms(prevState => ({
            ...prevState,
            [id]: value,
        }));
    }

    const handleEnter = (event) => {
        const data = {
            ED: symptoms.emergencyDepartment,
            durationOfSymptoms: symptoms.duration,
            listAllergies: symptoms.allergies,
            pastMedicalConditions: symptoms.pastMedical,
            generalSymptoms: {
              fever: symptoms.fever,
              chills: symptoms.chills,
              fatigue: symptoms.fatigue,
              weakness: symptoms.weakness,
              weightChange: symptoms.weightChange,
              nightSweats: symptoms.nightSweats,
            },
            respiratorySymptoms: {
              cough: symptoms.cough,
              shortnessOfBreath: symptoms.shortnessOfBreath,
              wheezing: symptoms.wheezing,
              soreThroat: symptoms.soreThroat,
              nasalCongestion: symptoms.nasalCongestion,
              chestPain: symptoms.chestPain,
            },
            gastrointestinalSymptoms: {
              nausea: symptoms.nausea,
              vomiting: symptoms.vomiting,
              diarrhea: symptoms.diarrhea,
              constipation: symptoms.constipation,
              abdominalPain: symptoms.abdominalPain,
              appetiteLoss: symptoms.lossOfAppetite,
            },
            neurologicalSymptoms: {
              headache: symptoms.headache,
              dizziness: symptoms.dizziness,
              numbness: symptoms.numbness,
              confusion: symptoms.confusion,
              memoryLoss: symptoms.memoryLoss,
              seizures: symptoms.seizures,
            },
            musculoskeletalSymptoms: {
              jointPain: symptoms.jointPain,
              musclePain: symptoms.musclePain,
              stiffness: symptoms.stiffness,
              backPain: symptoms.backPain,
            },
            cardiovascularSymptoms: {
              palpitations: symptoms.palpitations,
              swellinglegsAnkles: symptoms.swelling,
              chestPain: symptoms.chestPain,
              acceleratedHeartbeat: symptoms.fastHeartrate
            },
            skinSymptoms: {
              rash: symptoms.rash,
              itching: symptoms.itching,
              bruising: symptoms.skinColorChange,
              wounds: symptoms.wounds,
            },
            psychologicalSymptoms: {
              anxiety: symptoms.anxiety,
              depression: symptoms.depression,
              moodSwings: symptoms.moodSwings,
              sleepPatternChanges: symptoms.sleepChanges
            },
            substanceHabits: {
              alcohol: symptoms.alcohol,
              smoking: symptoms.smoke,
              drugs: symptoms.drugs,
            },
            consent: symptoms.consent,
            timestamp: new Date().toISOString(),
        }
        if(data.consent === false){
            setMessage("You must provide consent in order to enter the triage.");
            return
        } else if ( data.ED === "Select the emergency department you'd like to attend"){
            setMessage("You must select a hospital to enter the triage.");
            return
        }
        axios
            .post('http://localhost:8000/triage/triage-tickets', data)
            .then(response => {
                setMessage(response.data.message);
                const { symptoms } = response.data;
                // Redirect to homepage using navigate
                navigate('/patientWaiting'); // Replace '/' with the homepage URL if needed
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
                        <h1 className="text-center">Enter Virtual Triage</h1>
                    </Col>
                </Row>
            </Container>
            <div>
                <Container>
                    <Row>
                        <Dropdown>
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                {symptoms.emergencyDepartment}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={(event) => handleDropdown(event, "Victoria General Hosptial")}
                                    id="emergencyDepartment">
                                    Victoria General Hospital
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={(event) => handleDropdown(event, "Royal Jubilee Hospital")}
                                    id="emergencyDepartment">
                                    Royal Jubiliee Hospital
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Row>
                    <Row className="py-3">
                        <p>Please check all the symptoms you're currently experiencing:</p>
                        <Col>
                            <p>General Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='fever'
                                label='Fever'
                                checked={symptoms.fever}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='chills'
                                label='Chills'
                                checked={symptoms.chills}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='fatigue'
                                label='Fatigue'
                                checked={symptoms.fatigue}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='weakness'
                                label='Weakness'
                                checked={symptoms.weakness}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='weightChange'
                                label='Weight loss or gain'
                                checked={symptoms.weightChange}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='nightSweats'
                                label='Night sweats'
                                checked={symptoms.nightSweats}
                                onChange={handleSymptomChange}
                            />
                        </Col>
                        <Col>
                            <p>Respiratory Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='cough'
                                label='Cough (dry or productive)'
                                checked={symptoms.cough}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='shortnessOfBreath'
                                label='Shortness of breath'
                                checked={symptoms.shortnessOfBreath}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='wheezing'
                                label='Wheezing'
                                checked={symptoms.wheezing}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='soreThroat'
                                label='Sore throat'
                                checked={symptoms.soreThroat}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='nasalCongestion'
                                label='Nasal congestion or runny nose'
                                checked={symptoms.nasalCongestion}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='chestPain'
                                label='Chest pain'
                                checked={symptoms.chestPain}
                                onChange={handleSymptomChange}
                            />
                        </Col>
                        <Col>
                            <p>Gastrointestinal Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='nausea'
                                label='Nausea'
                                checked={symptoms.nausea}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='vomiting'
                                label='Vomiting'
                                checked={symptoms.vomiting}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='diarrhea'
                                label='Diarrhea'
                                checked={symptoms.diarrhea}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='constipation'
                                label='Constipation'
                                checked={symptoms.constipation}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='abdominalPain'
                                label='Abdominal pain or cramps'
                                checked={symptoms.abdominalPain}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='lossOfAppetite'
                                label='Loss of appetite'
                                checked={symptoms.lossOfAppetite}
                                onChange={handleSymptomChange}
                            />
                        </Col>
                        <Col>
                            <p>Neurological Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='headache'
                                label='Headache'
                                checked={symptoms.headache}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='dizziness'
                                label='Dizziness or lightheadedness'
                                checked={symptoms.dizziness}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='numbness'
                                label='Numbness or tingling'
                                checked={symptoms.numbness}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='confusion'
                                label='Confusion'
                                checked={symptoms.confusion}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='memoryLoss'
                                label='Memory loss'
                                checked={symptoms.memoryLoss}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='seizures'
                                label='Seizures'
                                checked={symptoms.seizures}
                                onChange={handleSymptomChange}
                            />
                        </Col>
                    </Row>
                    <Row className="py-3">
                        <Col>
                            <p>Musculoskeletal Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='jointPain'
                                label='Joint pain or swelling'
                                checked={symptoms.jointPain}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='musclePain'
                                label='Muscle pain or cramps'
                                checked={symptoms.musclePain}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='stiffness'
                                label='Stiffness'
                                checked={symptoms.stiffness}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='backPain'
                                label='Back pain'
                                checked={symptoms.backPain}
                                onChange={handleSymptomChange}
                            />
                        </Col>
                        <Col>
                            <p>Cardiovascular Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='palpitations'
                                label='Palpitations'
                                checked={symptoms.palpitations}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='swelling'
                                label='Swelling in the legs or ankles'
                                checked={symptoms.swelling}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='chestDiscomfort'
                                label='Chest pain or discomfort'
                                checked={symptoms.chestDiscomfort}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='fastHeartrate'
                                label='Fast heartrate'
                                checked={symptoms.fastHeartrate}
                                onChange={handleSymptomChange}
                            />
                        </Col>
                        <Col>
                            <p>Skin Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='rash'
                                label='Rash'
                                checked={symptoms.rash}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='itching'
                                label='Itching'
                                checked={symptoms.itching}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='skinColorChange'
                                label='Changes in skin color'
                                checked={symptoms.skinColorChange}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='wounds'
                                label='Wounds or sores'
                                checked={symptoms.wounds}
                                onChange={handleSymptomChange}
                            />
                        </Col>
                        <Col>
                            <p>Pyschological Symptoms</p>
                            <Form.Check
                                type='checkbox'
                                id='anxiety'
                                label='Anxiety'
                                checked={symptoms.anxiety}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='depression'
                                label='Depression'
                                checked={symptoms.depression}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='moodSwings'
                                label='Mood swings'
                                checked={symptoms.moodSwings}
                                onChange={handleSymptomChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='sleepChanges'
                                label='Changes in sleep patterns'
                                checked={symptoms.sleepChanges}
                                onChange={handleSymptomChange}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    id="duration"
                                    aria-label="duration"
                                    aria-describedby="basic-addon1"
                                    placeholder="Duration of Symptoms"
                                    onChange={handleTextChange}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    id="allergies"
                                    aria-label="allergies"
                                    aria-describedby="basic-addon1"
                                    placeholder="List any allergies."
                                    onChange={handleTextChange}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1"></InputGroup.Text>
                                <Form.Control
                                    id="pastMedical"
                                    aria-label="pastMedical"
                                    aria-describedby="basic-addon1"
                                    placeholder="Past Medical Conditions"
                                    onChange={handleTextChange}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>Do you smoke?</p>
                            <Form.Check
                                type='radio'
                                id='smoke'
                                label='Yes'
                                name='smoke'
                                checked={symptoms.smoke}
                                onChange={(event) => handleRadio(event, 'Yes')}
                            />
                            <Form.Check
                                type='radio'
                                id='smoke'
                                label='No'
                                name='smoke'
                                checked={symptoms.smoke === false}
                                onChange={(event) => handleRadio(event, 'No')}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>Do you consume alcohol?</p>
                            <Form.Check
                                type='radio'
                                id='alcohol'
                                label='Yes'
                                name='alcohol'
                                checked={symptoms.alcohol}
                                onChange={(event) => handleRadio(event, 'Yes')}
                            />
                            <Form.Check
                                type='radio'
                                id='alcohol'
                                label='No'
                                name='alcohol'
                                checked={symptoms.alcohol === false}
                                onChange={(event) => handleRadio(event, 'No')}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>Do you use recreational drugs?</p>
                            <Form.Check
                                type='radio'
                                id='drugs'
                                label='Yes'
                                name='drugs'
                                checked={symptoms.drugs}
                                onChange={(event) => handleRadio(event, 'Yes')}
                            />
                            <Form.Check
                                type='radio'
                                id='drugs'
                                label='No'
                                name='drugs'
                                checked={symptoms.drugs === false}
                                onChange={(event) => handleRadio(event, 'No')}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>I consent to the collection of my personal and medical information as described.</p>
                            <Form.Check
                                type='radio'
                                id='consent'
                                label='Yes'
                                name='consent'
                                checked={symptoms.consent}
                                onChange={(event) => handleRadio(event, 'Yes')}
                            />
                            <Form.Check
                                type='radio'
                                id='consent'
                                label='No'
                                name='consent'
                                checked={symptoms.consent === false}
                                onChange={(event) => handleRadio(event, 'No')}
                            />
                        </Col>
                    </Row>
                </Container>
                <Row>
                    {message && <p>{message}</p>}
                    <Button variant="light" onClick={handleEnter}>Enter</Button>{' '}
                </Row>
            </div>
        </div>
    );
}
export default EnterVirtualTriage;
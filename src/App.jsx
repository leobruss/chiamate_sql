import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup,
  Badge,
  Nav,
  Alert,
  ListGroup,
  Spinner,
  Modal
} from 'react-bootstrap';
import './App.css';

function App() {
  const [jsonData, setJsonData] = useState({
    people: [],
    courses: [],
    enrollments: []
  })
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTable, setActiveTable] = useState('students');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [peopleData, coursesData, enrollmentsData] = await Promise.all([
        fetch('http://127.0.0.1:8080/api/persone').then(res => res.json()),
        fetch('http://127.0.0.1:8080/api/corsi').then(res => res.json()),
        fetch('http://127.0.0.1:8080/api/iscrizioni').then(res => res.json())
      ])

      setJsonData({
        people: peopleData,
        courses: coursesData,
        enrollments: enrollmentsData
      })
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error)
      setError('Si è verificato un errore durante il caricamento dei dati. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/cerca/${searchQuery}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Errore nella ricerca:', error)
      setError('Errore durante la ricerca. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  const clearSearchResults = () => {
    setSearchResults([]);
    setSearchQuery('');
  };

  const renderPersonInfo = (person) => (
    <Card className="person-card shadow-sm border-0">
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0">{person.nome} {person.cognome}</h4>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <Badge bg="info" className="age-badge me-2">Età: {person.eta}</Badge>
          <span className="text-secondary">Studente</span>
        </div>
        
        <h5 className="section-title">Corsi Frequentati</h5>
        {person.corsi.length > 0 ? (
          <ListGroup variant="flush" className="course-list">
            {person.corsi.map((corso, idx) => (
              <ListGroup.Item key={idx} className="border-start border-4 border-primary ps-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="fw-bold">{corso.nome_corso}</div>
                  <div className="d-flex align-items-center">
                    <small className="text-muted me-2">Data: {corso.data_iscrizione}</small>
                    <Badge 
                      bg={corso.voto >= 18 ? 'success' : corso.voto === null ? 'warning' : 'danger'} 
                      className="vote-badge-sm"
                    >
                      {corso.voto === null ? 'In corso' : `Voto: ${corso.voto}`}
                    </Badge>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant="info">Nessun corso frequentato</Alert>
        )}
      </Card.Body>
    </Card>
  )

  const getVoteBadgeClass = (voto) => {
    if (voto === null) return 'warning';
    return voto >= 18 ? 'success' : 'danger';
  };

  const getVoteText = (voto) => {
    if (voto === null) return 'In corso';
    return `Voto: ${voto}`;
  };

  // Show message temporarily
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Open modal for add operations
  const handleOpenModal = (type) => {
    setModalType(type);
    setFormData({});
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let endpoint = '';
      if (modalType === 'addStudent') endpoint = 'persone';
      else if (modalType === 'addCourse') endpoint = 'corsi';
      else endpoint = 'iscrizioni';
      
      const response = await fetch(`http://127.0.0.1:8080/api/${endpoint}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Operazione fallita');
      
      setShowModal(false);
      await fetchAllData();
      setMessage({type: 'success', text: 'Dati aggiunti con successo!'});
    } catch (error) {
      setMessage({type: 'danger', text: error.message});
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const handleDelete = async (type, id) => {
    let confirmMessage = 'Sei sicuro di voler eliminare questo elemento?';
    
    // Special confirmation message for students
    if (type === 'persone') {
      confirmMessage = 'Sei sicuro di voler eliminare questo studente? Verranno eliminate anche tutte le sue iscrizioni ai corsi.';
    }
    
    if (!window.confirm(confirmMessage)) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/${type}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eliminazione fallita');
      }
      
      await fetchAllData();
      setMessage({type: 'success', text: 'Elemento eliminato con successo!'});
    } catch (error) {
      setMessage({type: 'danger', text: error.message});
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Errore</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchAllData}>Riprova</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="dashboard-container py-4">
      {/* Header */}
      <Card className="mb-4 shadow header-card border-0">
        <Card.Body>
          <Card.Title as="h1" className="header-title">Database Accademia</Card.Title>
          
          {/* Search box */}
          <Form className="mt-3" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Cerca nel database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="primary" onClick={handleSearch} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Cerca'}
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Status message */}
      {message && (
        <Alert variant={message.type} className="mb-3">
          {message.text}
        </Alert>
      )}

      {/* Main content */}
      <div className="fade-in">
        {/* Table controls */}
        <div className="mb-4 table-navigation">
          <Nav variant="pills" className="bg-white p-2 rounded shadow-sm">
            <Nav.Item>
              <Nav.Link 
                active={activeTable === 'students'} 
                onClick={() => setActiveTable('students')}
              >
                Studenti
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTable === 'courses'} 
                onClick={() => setActiveTable('courses')}
              >
                Corsi
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTable === 'enrollments'} 
                onClick={() => setActiveTable('enrollments')}
              >
                Iscrizioni
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        {Object.keys(searchResults).length > 0 && (
          <section className="search-results-section mb-4">
            <div className="section-header d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm mb-3">
              <h2 className="mb-0">Risultati Ricerca</h2>
              <Button variant="outline-secondary" size="sm" onClick={clearSearchResults}>
                Chiudi Risultati
              </Button>
            </div>
            <Row>
              {Object.entries(searchResults).map(([key, person]) => (
                <Col key={key} md={4} className="mb-4">
                  {renderPersonInfo(person)}
                </Col>
              ))}
            </Row>
          </section>
        )}

        {loading && !Object.keys(searchResults).length ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Caricamento dei dati in corso...</p>
          </div>
        ) : (
          <>
            {activeTable === 'students' && (
              <section className="table-section">
                <div className="section-header d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm mb-3">
                  <h2 className="mb-0">Elenco Studenti</h2>
                  <Button variant="success" onClick={() => handleOpenModal('addStudent')}>
                    <i className="bi bi-plus-circle"></i> Nuovo
                  </Button>
                </div>
                <Row>
                  {jsonData.people.map((person, index) => (
                    <Col key={index} md={4} className="mb-4">
                      <Card className="student-card h-100 shadow-sm hover-effect border-0">
                        <Card.Body>
                          <Card.Title className="d-flex justify-content-between align-items-center">
                            <span>{person[1]} {person[2]}</span>
                            <Badge bg="info" pill>ID: {person[0]}</Badge>
                          </Card.Title>
                          <Card.Text>
                            <div className="student-details mt-3">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-calendar me-2"></i>
                                <span>Età: {person[3]} anni</span>
                              </div>
                            </div>
                          </Card.Text>
                        </Card.Body>
                        <Card.Footer className="bg-transparent border-0 text-end">
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete('persone', person[0])}>
                            <i className="bi bi-trash"></i> Elimina
                          </Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </section>
            )}

            {activeTable === 'courses' && (
              <section className="table-section">
                <div className="section-header d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm mb-3">
                  <h2 className="mb-0">Corsi Disponibili</h2>
                  <Button variant="success" onClick={() => handleOpenModal('addCourse')}>
                    <i className="bi bi-plus-circle"></i> Nuovo
                  </Button>
                </div>
                <Row>
                  {jsonData.courses.map((course, index) => (
                    <Col key={index} md={4} className="mb-4">
                      <Card className="course-card h-100 shadow-sm hover-effect border-0">
                        <Card.Body>
                          <Card.Title>{course.nome_corso}</Card.Title>
                          <Card.Subtitle className="mb-3 text-muted">
                            <i className="bi bi-person me-1"></i> Prof. {course.docente}
                          </Card.Subtitle>
                          <Card.Text>
                            <div className="course-stats">
                              <Badge bg="light" text="dark">Crediti: {course.crediti}</Badge>
                              <Badge bg="light" text="dark">Ore: {course.ore}</Badge>
                              <Badge bg="primary">Iscritti: {course.num_iscritti}</Badge>
                            </div>
                          </Card.Text>
                        </Card.Body>
                        <Card.Footer className="bg-transparent border-0 text-end">
                          <Button 
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete('corsi', course.id || index+1)}
                            disabled={course.num_iscritti > 0}
                            title={course.num_iscritti > 0 ? "Impossibile eliminare un corso con iscrizioni" : ""}
                          >
                            <i className="bi bi-trash"></i> Elimina
                          </Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </section>
            )}

            {activeTable === 'enrollments' && (
              <section className="table-section">
                <div className="section-header d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm mb-3">
                  <h2 className="mb-0">Iscrizioni</h2>
                  <Button variant="success" onClick={() => handleOpenModal('addEnrollment')}>
                    <i className="bi bi-plus-circle"></i> Nuova
                  </Button>
                </div>
                <Row>
                  {jsonData.enrollments.map((enrollment, index) => (
                    <Col key={index} md={4} className="mb-4">
                      <Card className="enrollment-card shadow-sm border-0">
                        <Card.Header className="border-0 bg-white pt-3">
                          <Card.Title>{enrollment.nome} {enrollment.cognome}</Card.Title>
                        </Card.Header>
                        <Card.Body>
                          <p className="course-name fw-bold">{enrollment.corso}</p>
                          <div className="enrollment-details">
                            <div className="enrollment-date">
                              <span className="label">Data Iscrizione:</span>
                              <span className="value">{enrollment.data}</span>
                            </div>
                            <Badge 
                              bg={getVoteBadgeClass(enrollment.voto)}
                              className="mt-2 vote-badge"
                            >
                              {getVoteText(enrollment.voto)}
                            </Badge>
                          </div>
                        </Card.Body>
                        <Card.Footer className="bg-transparent border-0 text-end">
                          <Button 
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete('iscrizioni', enrollment.id || index+1)}
                          >
                            <i className="bi bi-trash"></i> Elimina
                          </Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </section>
            )}
          </>
        )}
      </div>

      {/* Modal for adding items */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'addStudent' ? 'Aggiungi Studente' : 
             modalType === 'addCourse' ? 'Aggiungi Corso' : 'Aggiungi Iscrizione'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {modalType === 'addStudent' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control name="nome" onChange={handleInputChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Cognome</Form.Label>
                  <Form.Control name="cognome" onChange={handleInputChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Età</Form.Label>
                  <Form.Control name="eta" type="number" min="18" max="100" onChange={handleInputChange} required />
                </Form.Group>
              </>
            )}
            
            {modalType === 'addCourse' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Nome Corso</Form.Label>
                  <Form.Control name="nome_corso" onChange={handleInputChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Docente</Form.Label>
                  <Form.Control name="docente" onChange={handleInputChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Crediti</Form.Label>
                  <Form.Control name="crediti" type="number" min="1" onChange={handleInputChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Ore</Form.Label>
                  <Form.Control name="ore" type="number" min="1" onChange={handleInputChange} required />
                </Form.Group>
              </>
            )}
            
            {modalType === 'addEnrollment' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Studente</Form.Label>
                  <Form.Select name="id_persona" onChange={handleInputChange} required>
                    <option value="">Seleziona studente...</option>
                    {jsonData.people.map((p, i) => (
                      <option key={i} value={p[0]}>
                        {p[1]} {p[2]}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Corso</Form.Label>
                  <Form.Select name="id_corso" onChange={handleInputChange} required>
                    <option value="">Seleziona corso...</option>
                    {jsonData.courses.map((c, i) => (
                      <option key={i} value={c.id || i+1}>
                        {c.nome_corso}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Data Iscrizione</Form.Label>
                  <Form.Control name="data_iscrizione" type="date" onChange={handleInputChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Voto (opzionale)</Form.Label>
                  <Form.Control name="voto" type="number" min="18" max="30" onChange={handleInputChange} />
                  <Form.Text className="text-muted">
                    Lascia vuoto se il corso è ancora in corso
                  </Form.Text>
                </Form.Group>
              </>
            )}
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Annulla
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Salva'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default App

CREATE TABLE IF NOT EXISTS persona (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    eta INTEGER
);

CREATE TABLE IF NOT EXISTS corso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_corso TEXT NOT NULL,
    docente TEXT NOT NULL,
    crediti INTEGER,
    ore INTEGER
);

CREATE TABLE IF NOT EXISTS iscrizione (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_persona INTEGER,
    id_corso INTEGER,
    data_iscrizione DATE,
    voto INTEGER,
    FOREIGN KEY (id_persona) REFERENCES persona(id),
    FOREIGN KEY (id_corso) REFERENCES corso(id)
);

DELETE FROM iscrizione;
DELETE FROM corso;
DELETE FROM persona;

INSERT INTO persona (id, nome, cognome, eta) VALUES 
    (1, 'Mario', 'Rossi', 20),
    (2, 'Luigi', 'Verdi', 22),
    (3, 'Anna', 'Bianchi', 21),
    (4, 'Francesco', 'Neri', 25),
    (5, 'Giulia', 'Romano', 19),
    (6, 'Marco', 'Ferrari', 23),
    (7, 'Sofia', 'Marino', 20),
    (8, 'Leonardo', 'Costa', 24),
    (9, 'Valentina', 'Rizzo', 22),
    (10, 'Andrea', 'Conti', 21),
    (11, 'Elena', 'Fontana', 19),    
    (12, 'Roberto', 'Gallo', 26),    
    (13, 'Chiara', 'Martini', 20),  
    (14, 'Davide', 'Leone', 23);    

INSERT INTO corso (id, nome_corso, docente, crediti, ore) VALUES 
    (1, 'Matematica', 'Prof. Bianchi', 9, 72),
    (2, 'Informatica', 'Prof. Neri', 12, 96),
    (3, 'Fisica', 'Prof. Rossi', 6, 48),
    (4, 'Chimica', 'Prof. Verdi', 8, 64),
    (5, 'Inglese', 'Prof. Smith', 6, 48),
    (6, 'Database', 'Prof. Ferrari', 9, 72),
    (7, 'Programmazione', 'Prof. Costa', 12, 96),
    (8, 'Statistica', 'Prof. Moretti', 6, 48),    
    (9, 'Economia', 'Prof. Romano', 9, 72),       
    (10, 'Arte', 'Prof. Greco', 4, 32);          

INSERT INTO iscrizione (id_persona, id_corso, data_iscrizione, voto) VALUES 
    (1, 1, '2023-09-01', 28),  
    (1, 2, '2023-09-01', 30),  
    (1, 6, '2023-09-02', 27),  
    
    (2, 1, '2023-09-01', 27),  
    (2, 3, '2023-09-02', 29),  
    (2, 4, '2023-09-02', 26),  
    
    (3, 2, '2023-09-01', 30),  
    (3, 6, '2023-09-01', 29), 
    (3, 7, '2023-09-02', 28), 
    
    (4, 1, '2023-09-03', 26), 
    (4, 2, '2023-09-03', 28), 
    (4, 3, '2023-09-03', 27), 
    (4, 5, '2023-09-04', 30), 
    
    (5, 1, '2023-09-02', 29), 
    (5, 2, '2023-09-02', 30), 
    (5, 5, '2023-09-03', 28), 
    
    (6, 1, '2023-09-01', 27), 
    (6, 3, '2023-09-01', 25), 
    (6, 4, '2023-09-02', 28), 
    
    (7, 2, '2023-09-02', 29), 
    (7, 5, '2023-09-02', 30), 
    (7, 7, '2023-09-03', 28), 
    
    (8, 2, '2023-09-01', 27), 
    (8, 6, '2023-09-01', 29), 
    (8, 7, '2023-09-02', 30), 
    
    (9, 1, '2023-09-02', 28), 
    (9, 4, '2023-09-02', 26), 
    (9, 5, '2023-09-03', 29), 
    
    (10, 2, '2023-09-01', 30),
    (10, 6, '2023-09-01', 28),
    (10, 7, '2023-09-02', 29),
    
    (12, 1, '2023-09-01', 15),
    (12, 2, '2023-09-01', 16),
    (12, 3, '2023-09-02', 14),
    
    (13, 1, '2023-09-01', 28),
    (13, 2, '2023-09-02', 16),
    (13, 4, '2023-09-03', 22),
    
    (14, 1, '2023-09-01', 30),
    (14, 2, '2023-09-01', 29),
    (14, 3, '2023-09-02', 30),
    
    (7, 8, '2023-09-04', 15),
    (8, 9, '2023-09-04', 17),
    
    (9, 8, '2023-09-10', NULL),
    (10, 9, '2023-09-10', NULL),
    
    (4, 9, '2023-10-01', NULL),
    (5, 10, '2023-10-01', NULL);

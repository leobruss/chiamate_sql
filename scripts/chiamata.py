from flask import Flask, request, render_template, jsonify, make_response
import sqlite3
import os

api = Flask(__name__)

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

@api.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        return response

@api.after_request
def after_request(response):
    return add_cors_headers(response)

def ConnectDB():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(current_dir, '..', 'db', 'accademia.db')
        print(f"Connecting to database at: {db_path}")
        
        if not os.path.exists(db_path):
            raise Exception(f"Database file not found at {db_path}")
            
        return sqlite3.connect(db_path)
    except Exception as e:
        print(f"Database connection error: {str(e)}")
        raise

@api.errorhandler(500)
def handle_500(error):
    response = jsonify({'error': str(error)})
    return add_cors_headers(response), 500

@api.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@api.route('/api/persone', methods=['GET'])
def StampaPersone():
    try:
        connection = ConnectDB()
        cursor = connection.cursor()
        
        query = "SELECT * FROM persona;"
        cursor.execute(query)
        result = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify(result)
    except Exception as e:
        print(f"Error in StampaPersone: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/api/cerca/<nome>', methods=['GET'])
def CercaPersona(nome):
    try:
        connection = ConnectDB()
        cursor = connection.cursor()
        
        print(f"Ricerca per nome: {nome}")  
        
        query = """
            SELECT p.nome, p.cognome, p.eta, 
                   c.nome_corso, i.data_iscrizione, i.voto
            FROM persona p
            LEFT JOIN iscrizione i ON p.id = i.id_persona
            LEFT JOIN corso c ON i.id_corso = c.id
            WHERE p.nome LIKE ? || '%' OR p.cognome LIKE ? || '%';
        """
        cursor.execute(query, (nome, nome))
        result = cursor.fetchall()
        
        print(f"Risultati trovati: {len(result)}")  
        
        formatted_result = {}
        for row in result:
            nome, cognome, eta, corso, data, voto = row
            person_key = f"{nome} {cognome}"
            
            if person_key not in formatted_result:
                formatted_result[person_key] = {
                    "nome": nome,
                    "cognome": cognome,
                    "eta": eta,
                    "corsi": []
                }
            
            if corso:  
                formatted_result[person_key]["corsi"].append({
                    "nome_corso": corso,
                    "data_iscrizione": data,
                    "voto": voto
                })
        
        print(f"Risultato formattato: {formatted_result}") 
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()
    
    return jsonify(formatted_result)

@api.route('/api/corsi', methods=['GET'])
def StampaCorsi():
    connection = ConnectDB()
    cursor = connection.cursor()
    
    query = """
        SELECT c.nome_corso, c.docente, c.crediti, c.ore,
               COUNT(i.id) as num_iscritti
        FROM corso c
        LEFT JOIN iscrizione i ON c.id = i.id_corso
        GROUP BY c.id;
    """
    cursor.execute(query)
    result = cursor.fetchall()
    
    formatted_result = [{
        "nome_corso": row[0],
        "docente": row[1],
        "crediti": row[2],
        "ore": row[3],
        "num_iscritti": row[4]
    } for row in result]
    
    cursor.close()
    connection.close()
    return jsonify(formatted_result)

@api.route('/api/iscrizioni', methods=['GET'])
def StampaIscrizioni():
    connection = ConnectDB()
    cursor = connection.cursor()
    
    query = """
        SELECT 
            p.nome, 
            p.cognome, 
            c.nome_corso, 
            i.data_iscrizione, 
            i.voto
        FROM iscrizione i
        JOIN persona p ON i.id_persona = p.id
        JOIN corso c ON i.id_corso = c.id
        ORDER BY i.data_iscrizione DESC, p.cognome, p.nome;
    """
    
    cursor.execute(query)
    result = cursor.fetchall()
    
    formatted_result = [{
        "nome": row[0],
        "cognome": row[1],
        "corso": row[2],
        "data": row[3],
        "voto": row[4] if row[4] is not None else None  
    } for row in result]
    
    cursor.close()
    connection.close()
    return jsonify(formatted_result)

@api.route('/api/persone', methods=['GET', 'POST'])
def manage_persone():
    if request.method == 'GET':
        return StampaPersone()
    elif request.method == 'POST':
        try:
            data = request.json
            connection = ConnectDB()
            cursor = connection.cursor()
            cursor.execute("INSERT INTO persona (nome, cognome, eta) VALUES (?, ?, ?)",
                          (data['nome'], data['cognome'], data['eta']))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api.route('/api/persone/<int:id>', methods=['DELETE'])
def delete_persona(id):
    try:
        connection = ConnectDB()
        cursor = connection.cursor()
        
        # First delete all related enrollments
        cursor.execute("DELETE FROM iscrizione WHERE id_persona = ?", (id,))
        
        # Then delete the person
        cursor.execute("DELETE FROM persona WHERE id = ?", (id,))
        
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"success": True, "message": "Studente e relative iscrizioni eliminati con successo"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/corsi', methods=['GET', 'POST'])
def manage_corsi():
    if request.method == 'GET':
        return StampaCorsi()
    elif request.method == 'POST':
        try:
            data = request.json
            connection = ConnectDB()
            cursor = connection.cursor()
            cursor.execute("INSERT INTO corso (nome_corso, docente, crediti, ore) VALUES (?, ?, ?, ?)",
                          (data['nome_corso'], data['docente'], data['crediti'], data['ore']))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api.route('/api/corsi/<int:id>', methods=['DELETE'])
def delete_corso(id):
    try:
        connection = ConnectDB()
        cursor = connection.cursor()
        # Check if course has enrollments
        cursor.execute("SELECT COUNT(*) FROM iscrizione WHERE id_corso = ?", (id,))
        if cursor.fetchone()[0] > 0:
            return jsonify({"error": "Impossibile eliminare un corso con iscrizioni attive"}), 400
        
        cursor.execute("DELETE FROM corso WHERE id = ?", (id,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/iscrizioni', methods=['GET', 'POST'])
def manage_iscrizioni():
    if request.method == 'GET':
        return StampaIscrizioni()
    elif request.method == 'POST':
        try:
            data = request.json
            connection = ConnectDB()
            cursor = connection.cursor()
            
            # Set voto to NULL if not provided
            voto = data.get('voto') if data.get('voto') else None
            
            cursor.execute("INSERT INTO iscrizione (id_persona, id_corso, data_iscrizione, voto) VALUES (?, ?, ?, ?)",
                          (data['id_persona'], data['id_corso'], data['data_iscrizione'], voto))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api.route('/api/iscrizioni/<int:id>', methods=['DELETE'])
def delete_iscrizione(id):
    try:
        connection = ConnectDB()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM iscrizione WHERE id = ?", (id,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    api.run(host="127.0.0.1", port=8080, debug=True)
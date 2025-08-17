from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from router.route import load_routes

app = Flask(__name__)
CORS(app)

load_routes(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

from flask import Flask
from routes.alerts import alerts_bp
from routes.playbooks import playbooks_bp
from routes.intel import intel_bp
from routes.auth import auth_bp

app = Flask(__name__)
app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
app.register_blueprint(playbooks_bp, url_prefix='/api/playbooks')
app.register_blueprint(intel_bp, url_prefix='/api/intel')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

if __name__ == '__main__':
    app.run(debug=True, port=5000)

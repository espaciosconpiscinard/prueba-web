import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

class GoogleSheetsService:
    def __init__(self):
        self.credentials_path = '/app/backend/google-credentials.json'
        self.sheet_id = os.getenv('GOOGLE_SHEETS_ID')
        self.scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        self.client = None
        self.sheet = None
        
    def connect(self):
        """Conectar con Google Sheets"""
        try:
            creds = ServiceAccountCredentials.from_json_keyfile_name(
                self.credentials_path, 
                self.scope
            )
            self.client = gspread.authorize(creds)
            self.sheet = self.client.open_by_key(self.sheet_id).sheet1
            logger.info("✅ Conectado a Google Sheets")
            return True
        except Exception as e:
            logger.error(f"❌ Error al conectar con Google Sheets: {str(e)}")
            return False
    
    def initialize_headers(self):
        """Inicializar encabezados si la hoja está vacía"""
        try:
            if not self.sheet:
                self.connect()
            
            # Verificar si ya tiene encabezados
            first_row = self.sheet.row_values(1)
            if not first_row or first_row[0] == '':
                headers = [
                    'Fecha Solicitud',
                    'Nombre Cliente',
                    'Teléfono',
                    'Fecha de Interés',
                    'Modalidad Preferida',
                    'Tipo de Actividad',
                    'Cantidad de Villas',
                    'Detalles de Villas',
                    'Estado'
                ]
                self.sheet.insert_row(headers, 1)
                # Formatear encabezados
                self.sheet.format('A1:I1', {
                    'textFormat': {'bold': True},
                    'backgroundColor': {'red': 0.031, 'green': 0.024, 'blue': 0.267}
                })
                logger.info("✅ Encabezados inicializados")
        except Exception as e:
            logger.error(f"❌ Error al inicializar encabezados: {str(e)}")
    
    def add_quote_request(self, data: dict):
        """
        Agregar una solicitud de cotización a Google Sheets
        
        Args:
            data: {
                'nombre': str,
                'telefono': str,
                'fecha_interes': str,
                'modalidad_general': str,
                'tipo_actividad': str,
                'villas': [
                    {
                        'code': str,
                        'zone': str,
                        'modality': str,
                        'price': float,
                        'currency': str
                    }
                ]
            }
        """
        try:
            if not self.sheet:
                self.connect()
            
            # Preparar detalles de villas
            villas_details = []
            for villa in data.get('villas', []):
                modality_label = {
                    'pasadia': '☀️ Pasadía',
                    'amanecida': '🌙 Amanecida',
                    'ambas': '☀️🌙 Ambas',
                    'evento': '🎉 Evento'
                }.get(villa['modality'], villa['modality'])
                
                detail = f"{villa['code']} ({villa['zone']}) - {modality_label}"
                if villa.get('price', 0) > 0:
                    detail += f" - {villa['currency']} {villa['price']:,.0f}"
                villas_details.append(detail)
            
            # Preparar fila
            row = [
                datetime.now().strftime('%Y-%m-%d %H:%M:%S'),  # Fecha solicitud
                data.get('nombre', ''),
                data.get('telefono', ''),
                data.get('fecha_interes', ''),
                data.get('modalidad_general', ''),
                data.get('tipo_actividad', ''),
                len(data.get('villas', [])),
                '\n'.join(villas_details),
                'Pendiente'
            ]
            
            # Agregar fila
            self.sheet.append_row(row)
            logger.info(f"✅ Solicitud agregada a Google Sheets: {data.get('nombre')}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error al agregar solicitud a Google Sheets: {str(e)}")
            return False

# Instancia global
sheets_service = GoogleSheetsService()

import json
import os
import re
import sqlite3
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
LOCAL_APPDATA = os.environ.get("LOCALAPPDATA")
DATA_DIR = Path(LOCAL_APPDATA) / "GreenValleyPublicSchool" if LOCAL_APPDATA else BASE_DIR / "data"
DB_PATH = DATA_DIR / "school.db"
HOST = "127.0.0.1"
PORT = 8000
CONTACT_PATTERN = re.compile(r"^[0-9+\-\s]{8,15}$")


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS admissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_name TEXT NOT NULL,
                grade TEXT NOT NULL,
                parent_name TEXT NOT NULL,
                contact_number TEXT NOT NULL,
                message TEXT,
                submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


def validate_payload(payload: dict) -> dict:
    student_name = str(payload.get("studentName", "")).strip()
    grade = str(payload.get("grade", "")).strip()
    parent_name = str(payload.get("parentName", "")).strip()
    contact_number = str(payload.get("contactNumber", "")).strip()
    message = str(payload.get("message", "")).strip()

    if not student_name:
        raise ValueError("Student name is required.")
    if not grade:
        raise ValueError("Grade is required.")
    if not parent_name:
        raise ValueError("Parent or guardian name is required.")
    if not CONTACT_PATTERN.fullmatch(contact_number):
        raise ValueError("Contact number must be 8 to 15 characters and use digits, spaces, +, or -.")
    if len(message) > 180:
        raise ValueError("Additional information must stay within 180 characters.")

    return {
        "student_name": student_name,
        "grade": grade,
        "parent_name": parent_name,
        "contact_number": contact_number,
        "message": message,
    }


class SchoolRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/api/admissions":
            with get_connection() as connection:
                rows = connection.execute(
                    """
                    SELECT id, student_name, grade, parent_name, contact_number, message, submitted_at
                    FROM admissions
                    ORDER BY id DESC
                    LIMIT 50
                    """
                ).fetchall()

            records = [
                {
                    "id": row["id"],
                    "studentName": row["student_name"],
                    "grade": row["grade"],
                    "parentName": row["parent_name"],
                    "contactNumber": row["contact_number"],
                    "message": row["message"],
                    "submittedAt": row["submitted_at"],
                }
                for row in rows
            ]
            self.send_json({"records": records})
            return

        super().do_GET()

    def do_POST(self) -> None:
        if self.path != "/api/admissions":
            self.send_error(HTTPStatus.NOT_FOUND, "Endpoint not found.")
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(content_length)
            payload = json.loads(body.decode("utf-8"))
            cleaned = validate_payload(payload)

            with get_connection() as connection:
                cursor = connection.execute(
                    """
                    INSERT INTO admissions (
                        student_name,
                        grade,
                        parent_name,
                        contact_number,
                        message
                    ) VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        cleaned["student_name"],
                        cleaned["grade"],
                        cleaned["parent_name"],
                        cleaned["contact_number"],
                        cleaned["message"],
                    ),
                )
                connection.commit()

            self.send_json(
                {
                    "message": "Admission inquiry saved successfully.",
                    "id": cursor.lastrowid,
                },
                status=HTTPStatus.CREATED,
            )
        except json.JSONDecodeError:
            self.send_json({"error": "Request body must be valid JSON."}, status=HTTPStatus.BAD_REQUEST)
        except ValueError as error:
            self.send_json({"error": str(error)}, status=HTTPStatus.BAD_REQUEST)
        except Exception:
            self.send_json(
                {"error": "The server could not save the admission inquiry."},
                status=HTTPStatus.INTERNAL_SERVER_ERROR,
            )


if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), SchoolRequestHandler)
    print(f"Green Valley server running at http://{HOST}:{PORT}")
    print(f"Admissions database: {DB_PATH}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()

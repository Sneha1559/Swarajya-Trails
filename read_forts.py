
from pathlib import Path
from pypdf import PdfReader

# Locate the folder containing historical PDFs
PROJECT_ROOT = Path(__file__).resolve().parent
PDF_FOLDER = PROJECT_ROOT / "data" / "forts"

def extract_pdf_text(pdf_path):
    reader = PdfReader(str(pdf_path))
    pages_text = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text()

        if text and text.strip():
            pages_text.append(
                f"\n--- Page {page_number} ---\n{text}"
            )

    return "\n".join(pages_text)


def main():
    pdf_files = list(PDF_FOLDER.glob("*.pdf"))

    if not pdf_files:
        print(f"No PDF files found in: {PDF_FOLDER}")
        return

    for pdf_path in pdf_files:
        print(f"\nReading: {pdf_path.name}")

        try:
            text = extract_pdf_text(pdf_path)

            if not text.strip():
                print("No selectable text found. The PDF may be scanned.")
                continue

            output_path = pdf_path.with_suffix(".txt")
            output_path.write_text(text, encoding="utf-8")

            print(f"Extracted text saved to: {output_path}")
            print("\nPreview:")
            print(text[:1000])

        except Exception as error:
            print(f"Could not read {pdf_path.name}: {error}")


if __name__ == "__main__":
    main()

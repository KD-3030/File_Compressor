import { HuffmanCoder } from './HuffmanCoder.js';

// Function to read .docx files
async function readDocx(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function (event) {
            const arrayBuffer = event.target.result;
            const docx = await window.docx.load(arrayBuffer);
            let text = "";
            docx.body.forEach(para => text += para.text + "\n");
            resolve(text);
        };
        reader.onerror = () => reject("Error reading DOCX file.");
        reader.readAsArrayBuffer(file);
    });
}

// Function to read .txt files
async function readTxt(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = () => reject("Error reading TXT file.");
        reader.readAsText(file, "UTF-8");
    });
}

onload = function () {
    const treearea = document.getElementById('treearea');
    const encode = document.getElementById('encode');
    const decode = document.getElementById('decode');
    const temptext = document.getElementById('temptext');
    const upload = document.getElementById('uploadedFile');

    const coder = new HuffmanCoder();

    upload.addEventListener('change', () => alert("File uploaded"));

    encode.onclick = async function () {
        const uploadedFile = upload.files[0];
        if (!uploadedFile) {
            alert("No file uploaded!");
            return;
        }

        const fileType = uploadedFile.name.split('.').pop().toLowerCase();
        let text = "";

        try {
            if (fileType === "docx") {
                text = await readDocx(uploadedFile);
            } else if (fileType === "txt") {
                text = await readTxt(uploadedFile);
            } else {
                alert("Unsupported file format! Please upload a .txt or .docx file.");
                return;
            }

            if (text.length === 0) {
                alert("File is empty! Please upload another file.");
                return;
            }

            const originalSize = new Blob([text]).size;

            let [encoded, tree_structure, info] = coder.encode(text);
            const compressedSize = new Blob([encoded]).size;
            const compressionRatio = (originalSize / compressedSize).toFixed(2);
            const compressionPercentage = ((1 - compressedSize / originalSize) * 100).toFixed(2);

            downloadFile(uploadedFile.name.split('.')[0] + '_encoded.txt', encoded);

            // Update UI
            treearea.innerText = tree_structure;
            temptext.innerText = `${info}\n\n📊 Compression Stats:\n- Original Size: ${originalSize} bytes\n- Compressed Size: ${compressedSize} bytes\n- Compression Ratio: ${compressionRatio}x\n- Space Savings: ${compressionPercentage}%`;
        } catch (error) {
            alert(error);
        }
    };

    decode.onclick = async function () {
        const uploadedFile = upload.files[0];
        if (!uploadedFile) {
            alert("No file uploaded!");
            return;
        }

        try {
            let text = await readTxt(uploadedFile); // Decoding only supports .txt

            let [decoded, tree_structure, info] = coder.decode(text);
            downloadFile(uploadedFile.name.split('.')[0] + '_decoded.txt', decoded);

            // Update UI
            treearea.innerText = tree_structure;
            temptext.innerText = info;
        } catch (error) {
            alert(error);
        }
    };
};

function downloadFile(fileName, data) {
    let a = document.createElement('a');
    a.href = "data:application/octet-stream," + encodeURIComponent(data);
    a.download = fileName;
    a.click();
}

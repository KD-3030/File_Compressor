import { BinaryHeap } from './BinaryHeap.js';

export { HuffmanCoder };

class HuffmanCoder {

    stringify(node) {
        if (typeof node[1] === "string") {
            return "'" + node[1];
        }
        return "0" + this.stringify(node[1][0]) + "1" + this.stringify(node[1][1]);
    }

    display(node, modify, index = 1) {
        if (modify) {
            node = ['', node];
            if (node[1].length === 1) node[1] = node[1][0];
        }

        if (typeof node[1] === "string") {
            return `${index} = ${node[1]}`;
        }

        let left = this.display(node[1][0], modify, index * 2);
        let right = this.display(node[1][1], modify, index * 2 + 1);
        return `${index * 2} <= ${index} => ${index * 2 + 1}\n${left}\n${right}`;
    }

    destringify(data) {
        let node = [];
        if (data[this.ind] === "'") {
            this.ind++;
            node.push(data[this.ind]);
            this.ind++;
            return node;
        }

        this.ind++;
        node.push(this.destringify(data));
        this.ind++;
        node.push(this.destringify(data));

        return node;
    }

    getMappings(node, path) {
        if (typeof node[1] === "string") {
            this.mappings[node[1]] = path;
            return;
        }
        this.getMappings(node[1][0], path + "0");
        this.getMappings(node[1][1], path + "1");
    }

    encode(data) {
        this.heap = new BinaryHeap();

        // Create frequency map
        const mp = new Map();
        for (let i = 0; i < data.length; i++) {
            mp.set(data[i], (mp.get(data[i]) || 0) + 1);
        }

        // Insert into heap
        for (const [key, value] of mp.entries()) {
            this.heap.insert([-value, key]);
        }

        // Build Huffman Tree
        while (this.heap.size() > 1) {
            const node1 = this.heap.extractMax();
            const node2 = this.heap.extractMax();
            const node = [node1[0] + node2[0], [node1, node2]];
            this.heap.insert(node);
        }

        const huffman_encoder = this.heap.extractMax();
        this.mappings = {};
        this.getMappings(huffman_encoder, "");

        // Create binary string
        let binaryArr = [];
        for (let i = 0; i < data.length; i++) {
            binaryArr.push(this.mappings[data[i]]);
        }
        let binary_string = binaryArr.join("");

        let rem = (8 - (binary_string.length % 8)) % 8;
        binary_string += "0".repeat(rem);

        let resultArr = [];
        for (let i = 0; i < binary_string.length; i += 8) {
            let num = 0;
            for (let j = 0; j < 8; j++) {
                num = (num << 1) | (binary_string[i + j] === "1" ? 1 : 0);
            }
            resultArr.push(String.fromCharCode(num));
        }

        let final_res = this.stringify(huffman_encoder) + '\n' + rem + '\n' + resultArr.join("");
        let info = `Compression complete and file sent for download\nCompression Ratio: ${data.length / final_res.length}`;
        return [final_res, this.display(huffman_encoder, false), info];
    }

    decode(data) {
        data = data.split('\n');
        if (data.length === 4) {
            data[0] += '\n' + data[1];
            data[1] = data[2];
            data[2] = data[3];
            data.pop();
        }

        this.ind = 0;
        const huffman_decoder = this.destringify(data[0]);
        const text = data[2];

        // Convert text to binary string
        let binaryArr = [];
        for (let i = 0; i < text.length; i++) {
            let num = text.charCodeAt(i);
            let bin = num.toString(2).padStart(8, '0');
            binaryArr.push(bin);
        }
        let binary_string = binaryArr.join("").slice(0, -data[1]);

        let resArr = [];
        let node = huffman_decoder;
        for (let i = 0; i < binary_string.length; i++) {
            node = binary_string[i] === "0" ? node[0] : node[1];

            if (typeof node[0] === "string") {
                resArr.push(node[0]);
                node = huffman_decoder;
            }
        }

        let res = resArr.join("");
        let info = "Decompression complete and file sent for download";
        return [res, this.display(huffman_decoder, true), info];
    }
}

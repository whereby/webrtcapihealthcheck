// Detect "health" of webRTC API/components.
// Are all there? have they been patched before out code is run?
// Should run before any code patching/changing webRTC stuff

// increment this whenever we add or remove things to check
const version = 1;

const nonNative = [] as string[];
const missing = [] as string[];

type FunctionNode = {
    f: string;
    o?: never;
};
type ObjectNode = {
    o: string;
    f?: never;
};
type NodeToCheck = (FunctionNode | ObjectNode) & {
    c?: NodeToCheck[];
};

let error: string | undefined = undefined;

// when adding or removing things to check, add comment for version number
const nodesToCheck: NodeToCheck[] = [
    {
        f: "RTCPeerConnection",
        c: [
            {
                o: "prototype",
                c: [
                    { f: "addIceCandidate" },
                    { f: "addEventListener" },
                    { f: "addTrack" },
                    { f: "addTransceiver" },
                    { f: "close" },
                    { f: "createAnswer" },
                    { f: "createDataChannel" },
                    { f: "createOffer" },
                    { f: "getConfiguration" },
                    { f: "getReceivers" },
                    { f: "getSenders" },
                    { f: "getStats" },
                    { f: "getTransceivers" },
                    { f: "removeEventListener" },
                    { f: "removeTrack" },
                    { f: "restartIce" },
                    { f: "setConfiguration" },
                    { f: "setLocalDescription" },
                    { f: "setRemoteDescription" },
                ],
            },
        ],
    },
    {
        f: "MediaStream",
        c: [
            {
                o: "prototype",
                c: [
                    { f: "addTrack" },
                    { f: "clone" },
                    { f: "getAudioTracks" },
                    { f: "getTracks" },
                    { f: "getVideoTracks" },
                    { f: "removeTrack" },
                ],
            },
        ],
    },
    {
        f: "MediaStreamTrack",
        c: [
            {
                o: "prototype",
                c: [
                    { f: "applyConstraints" },
                    { f: "clone" },
                    { f: "getCapabilities" },
                    { f: "getConstraints" },
                    { f: "getSettings" },
                    { f: "stop" },
                ],
            },
        ],
    },
    {
        o: "navigator",
        c: [
            { o: "mediaDevices", c: [{ f: "getUserMedia" }, { f: "getDisplayMedia" }, { f: "enumerateDevices" }] },
            { o: "mediaCapabilities", c: [{ f: "decodingInfo" }, { f: "encodingInfo" }] },
        ],
    },
];

const check = (path: string, component: any, toCheck: NodeToCheck[]) => {
    toCheck.forEach(({ f, o, c }) => {
        const currentPath = `${path}${path ? "_" : ""}${f ?? o}`;
        if (!component[f ?? o]) {
            missing.push(currentPath);
            return;
        }
        if (f) {
            if (!/\[native code\]/g.test(component[f].toString?.() || "")) {
                nonNative.push(currentPath);
            }
        }
        if (c) {
            check(currentPath, component[f ?? o], c);
        }
    });
};

try {
    check("", window, nodesToCheck);
} catch (ex) {
    error = "" + ex;
}

export function getWebRtcApiHealth() {
    return { version, nonNative, missing, error };
}

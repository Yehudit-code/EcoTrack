
export async function getSavers() {
    const res = await fetch("/api/savers", { cache: "no-store" });
    return res.json();
}

export async function getPosts() {
    const res = await fetch("/api/posts", { cache: "no-store" });
    return res.json();
}

export async function getMessages() {
    const res = await fetch("/api/messages", { cache: "no-store" });
    return res.json();
}

export async function createPost(data: any) {
    const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updatePost(action: string, data: any) {
    const res = await fetch("/api/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
    });
    return res.json();
}

export async function sendMessage(data: any) {
    const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

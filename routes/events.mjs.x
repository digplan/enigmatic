export default (r, s) => {
    let timerId = number || ''
    const body = new ReadableStream({
        start(controller) {
            timerId = setInterval(() => {
                controller.enqueue(msg)
            }, 1000);
        },
        cancel() {
            if (typeof timerId === "number") {
                clearInterval(timerId)
            }
        },
    })
    return new Response(body, {
        headers: {
            "Content-Type": "text/event-stream",
        },
    })
}
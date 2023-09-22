async function handleEvent(event) {
    let url = new URL(event.request.url)
    log(url.pathname)

    // upload file
    if (url.pathname.startsWith("/functions/upload")) {
        return AI.uploadFile(event.request)
    }

    // download file
    if (url.pathname.startsWith("/functions/file")) {
        return AI.downloadFile(url.pathname.substr(10))
    }

    let result
    let body = await event.request.json();
    let fn_index = body["fn_index"]
    let session_hash = body["session_hash"]
    let data = body["data"]
    log(fn_index)
    switch (fn_index) {
        // 根据图片训练模型
        case 3:
            result = await AI.trainModel(data[2], data[1], data[3], { session_hash: session_hash })
            break;
        // 列出基准模型下的loRa模型
        case 13:
            result = await AI.listModel(data[1])
            break;
        // 无限风格推理
        case 14:
            let option = {
                loRa_model: data[4],
                count: data[5],
                style: data[7],
                loRa_multilier: [data[8], data[9]],
                pose_control: data[10],
                pose_image: data[11],
                session_hash: session_hash
            }
            result = await AI.inferencePrompt([data[3]], data[1], data[2], option)
            break;

        default:
            // 前端业务交互逻辑
            result = await AI.fetchGradioRaw(body)
    }

    return new Response(JSON.stringify(result));
}

addEventListener('fetch', async (event) => {
    try {
        let response = await handleEvent(event);
        return event.respondWith(response);
    } catch (e) {
        return event.respondWith(new Response(e.message, { status: 500 }));
    }
});
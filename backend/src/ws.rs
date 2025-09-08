use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
    Extension,
};
use futures::stream::StreamExt;
use tokio::sync::broadcast;
use uuid::Uuid;

#[derive(Clone, Debug)]
pub enum WsMessage {
    Sync { note_id: Uuid, content: String },
}

type Tx = broadcast::Sender<WsMessage>;
type Rx = broadcast::Receiver<WsMessage>;

pub async fn note_ws(ws: WebSocketUpgrade, Extension(tx): Extension<Tx>) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, tx))
}

async fn handle_socket(mut socket: WebSocket, tx: Tx) {
    let mut rx: Rx = tx.subscribe();

    loop {
        tokio::select! {
            // Incoming messages from the WebSocket client
            incoming = socket.recv() => {
                match incoming {
                    Some(Ok(msg)) => {
                        if let Message::Text(text) = msg {
                            // Expected incoming format: "note_id:content"
                            if let Some((note_id_str, content)) = text.split_once(':') {
                                if let Ok(note_id) = Uuid::parse_str(note_id_str) {
                                    let _ = tx.send(WsMessage::Sync {
                                        note_id,
                                        content: content.to_string(),
                                    });
                                }
                            }
                        } else if let Message::Close(_) = msg {
                            break;
                        }
                    }
                    // Client disconnected or error
                    _ => break,
                }
            }

            // Broadcast messages from other clients
            broadcasted = rx.recv() => {
                match broadcasted {
                    Ok(WsMessage::Sync { note_id, content }) => {
                        let msg_text = format!("{}:{}", note_id, content);
                        // axum 0.8 expects Utf8Bytes for Message::Text; .into() converts String
                        if socket.send(Message::Text(msg_text.into())).await.is_err() {
                            break;
                        }
                    }
                    Err(_) => break,
                }
            }
        }
    }
}

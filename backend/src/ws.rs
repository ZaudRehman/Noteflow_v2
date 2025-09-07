use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
    Extension,
};
use futures::{sink::SinkExt, stream::StreamExt};
use std::collections::HashMap;
use tokio::sync::{broadcast, Mutex};
use std::sync::Arc;
use uuid::Uuid;

#[derive(Clone, Debug)]
pub enum WsMessage {
    Sync { note_id: Uuid, content: String },
}

type Tx = broadcast::Sender<WsMessage>;
type Rx = broadcast::Receiver<WsMessage>;

pub async fn note_ws(
    ws: WebSocketUpgrade,
    Extension(tx): Extension<Tx>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, tx))
}

async fn handle_socket(mut socket: WebSocket, tx: Tx) {
    let mut rx = tx.subscribe();

    loop {
        tokio::select! {
            // Incoming messages from Websocket client
            Some(Ok(msg)) = socket.next() => {
                if let Message::Text(text) = msg {
                    // messages in format: "note_id:content"
                    if let Some((note_id_str, content)) = text.split_once(':') {
                        if let Ok(note_id) = Uuid::parse_str(note_id_str) {
                            let broadcast_msg = WsMessage::Sync {
                                note_id,
                                content: content.to_string(),
                            };
                            // Send to all subscribers (including sender)
                            let _ = tx.send(broadcast_msg);
                        }
                    }
                } else if let Message::Close(_) = msg {
                    break;
                }
            }
            // Received broadcast messages (sent by other clients)
            Ok(msg) = rx.recv() => {
                if let WsMessage::Sync { note_id, content } = msg {
                    let msg_text = format!("{}:{}", note_id, content);
                    if socket.send(Message::Text(msg_text)).await.is_err() {
                        break;
                    }
                }
            }
            else => break,
        }
    }
}

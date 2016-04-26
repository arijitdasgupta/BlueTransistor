(ns webhook.messages
  (:gen-class))

(defn any-updates?
  [data]
  (or (get data "ok") (not (= 0 (count (get data "result"))))))

(defn get-last-update
  [result]
  (last result))

(defn get-other-updates
  [result]
  (butlast result))

(defn get-offset
  [result]
  (get (get-last-update result) "update_id"))

(defn get-chat-id
  [update]
  (-> update
    (get "message")
    (get "chat")
    (get "id")))

(defn get-the-text
  [update]
  (-> update
    (get "message")
    (get "text")))

(defn extract-color-information
  [text]
  nil)

(defn )

(defn parse-the-update
  [update message-callback request-callback]
  (let [
    text (clojure.string/lower-case (get-the-text update))
    chat-id (get-chat-id update)]
    (cond
      (= text 'help') (message-callback chat-id "So you do this and this and this")
      (= text 'map') (do
        (message-callback chat-id "You got it boss")
        (request-callback (extract-color-information text)))
      :else (message-callback chat-id "I don't understand!"))))

; message-callback chat-id, text -> to Telegram
; request-callback pur-lite-server-accepted-object -> to Lite Server
(defn do-the-thang
  [result message-callback request-callback]
  (let [
    other-updates (get-other-updates result)
    last-update (get-last-update result)]
    (do
      (map #(message-callback (get-chat-id %) "Sorry, you didn't get to at the right time") other-updates)
      (parse-the-update last-update message-callback request-callback))))

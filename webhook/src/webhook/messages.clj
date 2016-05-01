(ns webhook.messages
  (:gen-class))

(def last-update-id
  nil)

(def last-update-push-callback
  #(nil))

(def bulbs-status [])

(defn set-bulbs-status
  [status]
  (def bulbs-status status))

(defn set-last-update-id
  [id]
  (def last-update-id id))

(defn set-last-update-push-callback
  [funk]
  (def last-update-push-callback funk)

(defn push-last-update-id
  [update]
  (last-update-push-callback
    (-> update
      (get-update-id)
      (str))))

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

(defn get-update-id
  [update]
  (-> update
    (get "update_id")))

(defn get-the-text
  [update]
  (-> update
    (get "message")
    (get "text")))

(defn extract-color-information
  [text]
  nil)

(defn decorate-request-results
  [results]
  ())

(defn parse-the-update
  [update message-callback request-callback]
  (let [
    text (clojure.string/lower-case (get-the-text update))
    chat-id (get-chat-id update)
    update-id (get-update-id update)]
    (if (not (= update-id last-update-id))
      (cond
        (= text 'help') (message-callback chat-id "So you do this and this and this")
        (= text 'map') (let
          [request-results (request-callback (extract-color-information text))]
          (message-callback chat-id (decorate-request-results request-results)))
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

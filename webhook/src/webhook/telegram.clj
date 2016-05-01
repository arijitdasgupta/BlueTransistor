(ns webhook.telegram
  (:require [org.httpkit.client :as http])
  (:require [clojure.data.json :as json])
  (:require [webhook.helpers :as helpers])
  (:gen-class))

(use 'clostache.parser)

(def request-interval
  5000)

(defn- parse-data
  [body]
  (json/read-str body))

(defn- bot-url
  [token]
  (render "https://api.telegram.org/bot{{token}}/" {:token token}))

(defn- bot-action
  [token action]
  (helpers/concat-str (bot-url token) action))

; Returns data from a HTTP request
(defn- mk-request-to-telegram
  [url method body]
  (let [
    options {
      :url url
      :method method
      :headers {
        "Content-type" "application/json"}
      :body body}
    ]
    (parse-data (:body @(http/request options)))))

(defn- get-updates-body
  [offset]
  (json/write-str (merge
    {"timeout" 10 "limit" 100}
    (when offset {"offset" offset}))))

(defn- send-message-body
  [text chat-id]
  {"chat_id" chat-id "text" text})

(defn get-updates
  [token offset]
  (let [
    url (bot-action token "getUpdates")
    body (get-updates-body offset)]
    (mk-request-to-telegram url :post body)))

(defn get-me
  [token]
  (let
    [url (bot-action token "getMe")]
    (mk-request-to-telegram url :get)))

(defn send-message
  [token text chat-id]
  (let [
    url (bot-action token "sendMessage")
    body (send-message-body text chat-id)]
    (mk-request-to-telegram url :post body)))

(ns webhook.telegram
  (:require [org.httpkit.client :as http])
  (:require [clojure.data.json :as json])
  (:gen-class))

(use 'clostache.parser)

(defn- parse-data
  [body]
  (json/read-str body))

(defn- bot-url
  [token]
  (render "https://api.telegram.org/bot{{token}}/" {:token token}))

(defn- bot-action
  [token action]
  (clojure.string/join  "" [(bot-url token) action]))

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

(defn get-updates
  [token offset]
  (let [
    url (bot-action token "getUpdates")
    body (get-updates-body offset)
    ]
    (mk-request-to-telegram url :post body)))

(defn get-me
  [token]
  (bot-action token "getMe"))

(defn send-message
  [token]
  (bot-action token "sendMessage"))

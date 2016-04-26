(ns webhook.messages
  (:gen-class)
  (:require [clojure.data.json :as json]))

(defn any-updates?
  [data]
  (or (get data "ok") (not (= 0 (count (get data "result"))))))

(defn get-last-update
  [result]
  (last result))

(defn get-offset
  [result]
  (get (get-last-update result) "update_id"))

(defn get-chat-id
  [update]
  (-> update
    (get "message")
    (get "chat")
    (get "id")))

(defn do-whatever
  [result]
  (do (println result)))

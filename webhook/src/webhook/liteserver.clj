(ns webhook.liteserver
  (:require [org.httpkit.client :as http])
  (:require [clojure.data.json :as json])
  (:gen-class))

(defn send-update
  [lite-server update]
  (println lite-server)
  (println update)
  nil)

(defn get-status
  [lite-server])

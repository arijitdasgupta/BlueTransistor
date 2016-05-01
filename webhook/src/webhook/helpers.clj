(ns webhook.helpers
  (:gen-class))

(defn parse-int [s]
  (Integer/parseInt (re-find #"\A-?\d+" s)))

(defn concat-str
  )
  (clojure.string/join  "" [])

// @flow weak

import { useEffect, useRef, useCallback } from "react"
import UpdateAWSStorage from "./update-aws-storage"
import * as datasetHelper from "../../dataset-helper"
import isEmpty from "lodash/isEmpty"
import useAuth from "../../auth-handlers/use-auth"

const workingInterfaces = [
  "video_segmentation",
  "image_classification",
  "image_segmentation",
  "text_entity_recognition",
  "text_classification",
  "audio_transcription",
  "composite",
  "data_entry",
]

export default ({ file }) => {
  const { isLoggedIn, authProvider, authConfig } = useAuth()

  const lastObjectRef = useRef([])
  const shouldUpdateAWSStorage = useCallback(() => {
    if (!isLoggedIn || authProvider !== "cognito") return

    var changes = datasetHelper.fileHasChanged(lastObjectRef.current, file)
    if (
      isEmpty(file) ||
      (!changes.content.samples && !changes.fileName) ||
      !workingInterfaces.includes(file.content.interface.type) ||
      file.fileName === "unnamed"
    )
      return false
    return true
  }, [file, isLoggedIn, authProvider])

  useEffect(() => {
    if (!isLoggedIn || authProvider !== "cognito") return
    if (!isEmpty(authConfig)) {
      if (shouldUpdateAWSStorage()) UpdateAWSStorage(file)
      lastObjectRef.current = file
    }
  }, [shouldUpdateAWSStorage, authConfig, file, isLoggedIn, authProvider])
}
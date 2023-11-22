import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design"
import { useEffect, useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css"
import { Network, Provider } from "aptos"
import "./App.css"

export const provider = new Provider(Network.TESTNET)
export const moduleAddress = "0x664d5de7d80f03b014b3490332590438dcc4ecb7e66c8477ec726d78f83119d7"

function App() {
  const { account, signAndSubmitTransaction } = useWallet()
  const [counter, setCounter] = useState<number>(0)
  const [reload, setReload] = useState<number>(0)

  const fetch = async () => {
    if (!account) return
    try {
      const todoListResource = await provider.getAccountResource(
        account?.address,
        `${moduleAddress}::mycounter::CountHolder`
      )
      let data = JSON.parse((todoListResource?.data as any).count)
      setCounter(data)
      if (reload) {
        window.location.reload()
      }
    } catch (e: any) {
      initialize()
    }
  }

  const initialize = async () => {
    if (!account) return []
    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::mycounter::initialize`,
      type_arguments: [],
      arguments: [],
    }
    try {
      const response = await signAndSubmitTransaction(payload)
      await provider.waitForTransaction(response.hash)
    } catch (error: any) {
      console.log(error)
    }
  }

  const incrementCounter = async () => {
    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::mycounter::increment`,
      type_arguments: [],
      arguments: [],
    }
    try {
      const response = await signAndSubmitTransaction(payload)
      await provider.waitForTransaction(response.hash)
      window.location.reload()
    } catch (error: any) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetch()
  }, [account?.address])

  const timer = () => {
    setInterval(() => {
      setReload(1)
      fetch()
    }, 10000)
  }

  useEffect(() => {
    timer()
  }, [account?.address])

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "97vh",
      }}
    >
      <WalletSelector />
      <div className="count">
        <p style={{ fontSize: "80px", textAlign: "center" }}>Count: {counter}</p>
        <button disabled={!account} onClick={incrementCounter} className="increment-button">
          <span role="img" aria-label="Increment">
            &#128073;
          </span>
        </button>
      </div>
    </div>
  )
}

export default App

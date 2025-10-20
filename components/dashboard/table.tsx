"use client"
import React, { useState, useEffect } from "react"
import { Copy, Plus, Trash2, ChevronDown, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWalletStore } from "@/store/walletStore"

const ETH_REGEX = /^0x[a-fA-F0-9]{40}$/


export default function WalletManagementTable() {
  const { wallets, addWallets, removeWallet } = useWalletStore()
  const [filteredWallets, setFilteredWallets] = useState([])
  const [selectedWallets, setSelectedWallets] = useState(new Set())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [input, setInput] = useState("")
  const [error, setError] = useState(null)
  const [filterText, setFilterText] = useState("")
  const [sortBy, setSortBy] = useState(null)
  const [sortOrder, setSortOrder] = useState("asc")
  const [currentPage, setCurrentPage] = useState(0)
  const [showColumns, setShowColumns] = useState({
    address: true,
    addedDate: true,
  })
  const pageSize = 5

  useEffect(() => {
    let filtered = wallets.filter(wallet =>
      wallet.address.toLowerCase().includes(filterText.toLowerCase())
    )

    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        if (sortOrder === "asc") {
          return aVal > bVal ? 1 : -1
        }
        return aVal < bVal ? 1 : -1
      })
    }

    setFilteredWallets(filtered)
  }, [wallets, filterText, sortBy, sortOrder])

  const parseAddresses = (text) =>
    text
      .split(/[\s,;\n\r]+/g)
      .map((s) => s.trim())
      .filter(Boolean)

  const handleAddWallet = () => {
    setError(null)
    const candidates = parseAddresses(input)
    if (candidates.length === 0) return

    const invalid = candidates.filter((a) => !ETH_REGEX.test(a))
    if (invalid.length > 0) {
      setError(
        `Invalid address${invalid.length > 1 ? "es" : ""}: ${invalid.join(", ")}`
      )
      return
    }

    const newWallets = candidates.map((addr, index) => ({
      id: `wallet-${Date.now()}-${index}`,
      address: addr,
      addedDate: new Date().toISOString().split('T')[0],
    }))

    addWallets(newWallets)
    setInput("")
    setIsAddDialogOpen(false)
  }

  const handleRemove = (address) => {
    removeWallet(address)
    setSelectedWallets((prev) => {
      const newSet = new Set(prev)
      newSet.delete(address)
      return newSet
    })
  }

  const handleCopy = async (address) => {
    try {
      await navigator.clipboard.writeText(address)
    } catch {}
  }

  const handleBulkDelete = () => {
    removeWallets(selectedWallets)
    setSelectedWallets(new Set())
  }

  const toggleSelectAll = () => {
    const currentPageWallets = paginatedWallets.map(w => w.address)
    const allSelected = currentPageWallets.every(addr => selectedWallets.has(addr))
    
    if (allSelected) {
      setSelectedWallets(prev => {
        const newSet = new Set(prev)
        currentPageWallets.forEach(addr => newSet.delete(addr))
        return newSet
      })
    } else {
      setSelectedWallets(prev => new Set([...prev, ...currentPageWallets]))
    }
  }

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const paginatedWallets = filteredWallets.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )
  const totalPages = Math.ceil(filteredWallets.length / pageSize)

  return (
    <div className="w-full py-4 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-1 min-w-0">
          <Input
            placeholder="Filter wallets..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="max-w-sm"
          />
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-dashed whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" /> Add Wallets
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Wallet Addresses</DialogTitle>
                <DialogDescription>
                  Paste one or more Ethereum addresses. Separate multiple addresses with commas, spaces, or new lines.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Input
                  type="text"
                  placeholder="0x3C6b5B3e25..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddWallet()
                    }
                  }}
                />
                {error && (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddWallet}>Add</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {selectedWallets.size > 0 && (
            <Button 
              variant="destructive" 
              className="border-dashed whitespace-nowrap"
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedWallets.size})
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                View <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={showColumns.address}
                onCheckedChange={(value) =>
                  setShowColumns({ ...showColumns, address: value })
                }
              >
                Address
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showColumns.addedDate}
                onCheckedChange={(value) =>
                  setShowColumns({ ...showColumns, addedDate: value })
                }
              >
                Added Date
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="whitespace-nowrap">Generate Proof</Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    className="rounded border"
                    checked={paginatedWallets.length > 0 && paginatedWallets.every(w => selectedWallets.has(w.address))}
                    onChange={toggleSelectAll}
                  />
                </th>
                {showColumns.address && (
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => toggleSort("address")}
                      className="font-medium"
                    >
                      Wallet Address
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                )}
                {showColumns.addedDate && (
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => toggleSort("addedDate")}
                      className="font-medium"
                    >
                      Added Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                )}
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedWallets.length > 0 ? (
                paginatedWallets.map((wallet) => (
                  <tr key={wallet.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 py-2 align-middle">
                      <input
                        type="checkbox"
                        className="rounded border"
                        checked={selectedWallets.has(wallet.address)}
                        onChange={() => {
                          setSelectedWallets(prev => {
                            const newSet = new Set(prev)
                            if (newSet.has(wallet.address)) {
                              newSet.delete(wallet.address)
                            } else {
                              newSet.add(wallet.address)
                            }
                            return newSet
                          })
                        }}
                      />
                    </td>
                    {showColumns.address && (
                      <td className="p-4 py-2 align-middle">
                        <code className="text-sm break-all">{wallet.address}</code>
                      </td>
                    )}
                    {showColumns.addedDate && (
                      <td className="p-4 py-2 align-middle">
                        {wallet.addedDate}
                      </td>
                    )}
                    <td className="p-4 py-2 align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleCopy(wallet.address)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy address
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemove(wallet.address)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove wallet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="h-24 text-center">
                    No wallets found. Click "Add Wallets" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedWallets.size} of {filteredWallets.length} wallet(s) selected
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <div className="flex items-center px-3 text-sm">
            Page {currentPage + 1} of {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
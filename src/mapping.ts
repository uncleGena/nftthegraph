import { Address, BigInt, Entity } from "@graphprotocol/graph-ts"
import {
  ProfITNFT,
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  Transfer,
} from "../generated/ProfITNFT/ProfITNFT"
import { TransferEntity, TokenEntity, OwnerEntity } from "../generated/schema"

export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // // Entities only exist after they have been saved to the store;
  // // `null` checks allow to create entities on demand
  // if (entity == null) {
  //   entity = new ExampleEntity(event.transaction.from.toHex())

  //   // Entity fields can be set using simple assignments
  //   entity.count = BigInt.fromI32(0)
  // }

  // // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // // Entity fields can be set based on event parameters
  // entity.owner = event.params.owner
  // entity.approved = event.params.approved

  // // Entities can be written to the store with `.save()`
  // entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = ProfITNFT.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.balanceOf(...)
  // - contract.baseURI(...)
  // - contract.getApproved(...)
  // - contract.isApprovedForAll(...)
  // - contract.mintNft(...)
  // - contract.name(...)
  // - contract.owner(...)
  // - contract.ownerOf(...)
  // - contract.supportsInterface(...)
  // - contract.symbol(...)
  // - contract.tokenByIndex(...)
  // - contract.tokenOfOwnerByIndex(...)
  // - contract.tokenURI(...)
  // - contract.totalSupply(...)

  let token = TokenEntity.load(event.params.tokenId.toHex())
  if (token == null) {
    token = new TokenEntity(event.params.tokenId.toHex())
  }
  token.approved = event.params.owner
  token.save()
}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransfer(event: Transfer): void {
  // let { from, to, tokenId } = event.params
  let contract = ProfITNFT.bind(event.address)

  // let entity = Tranfer.load(event.transaction.from.toHex())
  let transfer = new TransferEntity(event.transaction.hash.toHex() + event.logIndex.toHex())
  transfer.from = justCreated(event.params.from) ? null : event.params.from.toHex()
  transfer.to = event.params.to.toHex()
  transfer.token = event.params.tokenId.toHex()
  transfer.date = event.block.timestamp.toString()
  transfer.save()

  // if just created new token
  if (justCreated(event.params.from)) {
    let token = new TokenEntity(event.params.tokenId.toHex())
    token.owner = event.params.to.toHex()
    token.name = contract.name()
    token.symbol = contract.symbol()
    token.block = event.block.number.toString()
    token.tokenURI = contract.tokenURI(event.params.tokenId)
    token.save()
  }

  let owner = OwnerEntity.load(event.params.to.toHex())
  if (owner == null) {
    owner = new OwnerEntity(event.params.to.toHex())
    owner.address = event.params.to
    owner.approved = false
    owner.save()
  }
}

function justCreated(from: Address): boolean {
  return from.toHex().startsWith('0x000000000000')
}

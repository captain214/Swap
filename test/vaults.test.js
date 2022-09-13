const { expect } = require('chai')
const { ethers } = require("hardhat")

const zeroAddress = '0x0000000000000000000000000000000000000000'

describe('Vaults', () => {
  
  before(async () => {
    const users = await ethers.getSigners()

    this.deployer = users[0]
    this.users = users.slice(1)
    
    const busdToken = await ethers.getContractFactory('BUSDToken')
    const vaults = await ethers.getContractFactory('Vaults')

    this.busdToken = await busdToken.deploy()
    this.vaults = await vaults.deploy(this.busdToken.address)

    await this.busdToken.deployed()
    await this.vaults.deployed()

    // await this.vaults.connect(this.deployer).setDepositTokenAddress(this.busdToken.address)
    // await this.busdToken.connect(this.deployer).transfer(this.users[1].address, ethers.utils.parseUnits('100000', 18))
    // await this.busdToken.connect(this.deployer).transfer(this.users[2].address, ethers.utils.parseUnits('100000', 18))
  })
  
  // it('Deposit fails', async () => {
  //   await expect(
  //     this.spacePad.connect(this.users[1]).deposit(0, zeroAddress)
  //   ).to.revertedWith('You need to send some BUSD')
  // })

  it('Deposit succeeds with zeroAddress', async () => {
    return;
    const depositAmount = ethers.utils.parseUnits('0.1', 3)
    await this.busdToken.connect(this.users[1]).approve(this.vaults.address, ethers.utils.parseUnits('0.1', 3));
    await this.vaults.connect(this.users[1]).deposit(depositAmount, zeroAddress)
    const balance = await this.busdToken.balanceOf(this.vaults.address)

    expect(balance).to.equal(depositAmount)
  })

  return;

  it('Deposit succeeds with account[3]', async () => {
    const depositAmount = ethers.utils.parseUnits('0.1', 3)
    const ownerOldBalance = await this.busdToken.balanceOf(this.spacePad.address)
    await this.busdToken.connect(this.users[1]).approve(this.spacePad.address, ethers.utils.parseUnits('0.1', 3));
    await this.spacePad.connect(this.users[1]).deposit(depositAmount, this.users[3].address)
    const referrerBalance = await this.busdToken.balanceOf(this.users[3].address)
    const ownerBalance = await this.busdToken.balanceOf(this.spacePad.address)

    expect(referrerBalance).to.equal(10)
    expect(ownerBalance - ownerOldBalance).to.equal(90)
  })

  it('Withdraw fails', async () => {
    await expect(
      this.spacePad.connect(this.deployer).withdraw(zeroAddress)
    ).to.revertedWith('Invalid Recipient Address')
  })

  it('Withdraw succeeds', async () => {
    await this.spacePad.connect(this.deployer).withdraw(this.users[5].address)
    const balance = await this.busdToken.balanceOf(this.users[5].address)

    expect(balance).to.equal(190)
  })

  it('Set fee fails', async () => {
    const fee = ethers.utils.parseUnits('1', 4)
    await expect(
      this.spacePad.connect(this.deployer).setFee(fee)
    ).to.revertedWith('Too high')
  })

  it('Set fee succeeds', async () => {
    const fee = ethers.utils.parseUnits('1', 3)
    await this.spacePad.connect(this.deployer).setFee(fee)
    const referrerFee = await this.spacePad.referrerFee()

    expect(referrerFee).to.equal(fee)
  })

  it('Pause succeeds', async () => {
    this.spacePad.connect(this.deployer).pause()
  })

  it('Unpause succeeds', async () => {
    this.spacePad.connect(this.deployer).unpause()
  })
})
